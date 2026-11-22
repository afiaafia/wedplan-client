"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  Image as ImageIcon,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { getSession, signIn, signOut, signUp } from "@/lib/auth-client";
import { authErrorMessage, authQueryErrorMessage } from "@/lib/auth-errors";
import { useToast } from "@/components/layout/toast-provider";
import { uploadProfileImage } from "@/lib/profile-api";
import { validateSignUpPassword } from "@/lib/password";
import { getSafeRedirectPath } from "@/lib/redirect-path";
import {
  isAllowedPostAuthDestination,
  isAllowedPostAuthRedirect,
} from "@/lib/route-access";
import {
  DEFAULT_ROLE,
  getRoleDashboard,
  isRegistrationRole,
  normalizeRole,
  REGISTRATION_ROLES,
  type RegistrationRole,
  type UserRole,
} from "@/lib/roles";

function getFrontendUrl(path: string = "/"): string {
  const base =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return new URL(path, base).toString();
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="19"
      height="19"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  audience?: "customer" | "vendor";
};

export default function AuthForm({ mode, audience = "customer" }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const isSignUp = mode === "sign-up";
  const isVendorSignIn = !isSignUp && audience === "vendor";
  const allowedRoles: readonly UserRole[] | null = isVendorSignIn
    ? ["vendor", "admin"]
    : null;

  const roleParam = searchParams.get("role");
  const [role, setRole] = useState<RegistrationRole>(() =>
    isRegistrationRole(roleParam) ? roleParam : DEFAULT_ROLE,
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [roleMismatch, setRoleMismatch] = useState(false);

  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const error = formError || authQueryErrorMessage(errorParam, errorDescription);
  const showRoleMismatch = roleMismatch || errorParam === "not_vendor";

  async function redirectAfterAuth() {
    const result = await getSession();
    const sessionRole = result.data?.user?.role;
    const normalizedRole = normalizeRole(sessionRole);

    if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
      await signOut();
      setRoleMismatch(true);
      setFormError(
        normalizedRole === "customer"
          ? "This account is a customer account. Please use Customer Sign In."
          : "This account cannot access the vendor dashboard."
      );
      return;
    }

    const requestedPath = getSafeRedirectPath(
      searchParams.get("redirect"),
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000"
    );
    const target =
      requestedPath && isAllowedPostAuthRedirect(requestedPath, normalizedRole)
        ? requestedPath
        : getRoleDashboard(normalizedRole);

    showToast({
      title: isSignUp ? "Account created" : "Signed in",
      description: `Welcome${result.data?.user?.name ? `, ${result.data.user.name}` : ""}.`,
      variant: "success",
    });

    router.replace(target);
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});
    setRoleMismatch(false);

    const errors: Record<string, string> = {};
    const trimmedName = name.trim();

    if (!isRegistrationRole(role) && isSignUp) {
      errors.role = "Please choose Customer or Vendor.";
    }
    if (isSignUp && trimmedName.length < 2) {
      errors.name = "Please enter your full name.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    const passwordError = isSignUp
      ? validateSignUpPassword(password)
      : password.length === 0
        ? "Please enter your password."
        : null;
    if (passwordError) errors.password = passwordError;
    if (profileImage && !profileImage.type.startsWith("image/")) {
      errors.image = "Choose an image file.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast({
        title: "Check your details",
        description: "Please fix the highlighted fields and try again.",
        variant: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const callbackURL = getFrontendUrl("/dashboard");

      if (isSignUp) {
        const payload = {
          name: trimmedName,
          email: email.trim(),
          password,
          callbackURL,
          role,
        } as Parameters<typeof signUp.email>[0] & {
          role: RegistrationRole;
        };

        const result = await signUp.email(payload);

        if (result.error) {
          const message = authErrorMessage(result.error);
          setFormError(message);
          showToast({ title: "Sign up failed", description: message, variant: "error" });
          return;
        }

        if (profileImage) {
          try {
            await uploadProfileImage(profileImage);
          } catch (uploadError) {
            showToast({
              title: "Profile image not uploaded",
              description:
                uploadError instanceof Error
                  ? uploadError.message
                  : "Your account was created, but the image could not be uploaded.",
              variant: "error",
            });
          }
        }

        await redirectAfterAuth();
      } else {
        const result = await signIn.email({
          email: email.trim(),
          password,
          ...(isVendorSignIn ? {} : { callbackURL }),
          rememberMe: true,
        });

        if (result.error) {
          const message = authErrorMessage(result.error);
          setFormError(message);
          showToast({ title: "Sign in failed", description: message, variant: "error" });
          return;
        }

        await redirectAfterAuth();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setFormError(message);
      showToast({ title: "Authentication failed", description: message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setFormError("");
    setRoleMismatch(false);
    setGoogleLoading(true);

    try {
      const requestedPath = getSafeRedirectPath(
        searchParams.get("redirect"),
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      );
      const destination =
        requestedPath && isAllowedPostAuthDestination(requestedPath)
          ? requestedPath
          : null;
      const callbackPath = isVendorSignIn
        ? `/vendor/auth/callback${destination ? `?redirect=${encodeURIComponent(destination)}` : ""}`
        : destination ?? getRoleDashboard("customer");
      const result = await signIn.social({
        provider: "google",
        callbackURL: getFrontendUrl(callbackPath),
        errorCallbackURL: getFrontendUrl(
          isVendorSignIn ? "/vendor/sign-in" : isSignUp ? "/sign-up" : "/sign-in"
        ),
      });

      if (result?.error) {
        const message = authErrorMessage(result.error);
        setFormError(message);
        showToast({ title: "Google sign-in failed", description: message, variant: "error" });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Google authentication failed.";
      setFormError(message);
      showToast({ title: "Google sign-in failed", description: message, variant: "error" });
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-12 pt-32 sm:px-6">
      <div className="pointer-events-none absolute left-[-120px] top-40 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-10 right-[-100px] h-80 w-80 rounded-full bg-champagne/15 blur-[110px]" />

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-[0_25px_100px_rgba(48,39,42,0.09)] md:grid-cols-2">
        <section className="relative hidden min-h-[640px] flex-col justify-between overflow-hidden bg-primary p-12 text-white md:flex">
          <div className="absolute -right-28 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-8 h-48 w-48 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/[0.05]" />

          <div className="relative">
            <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
              <Heart size={23} />
            </div>

            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-white/65">
              Your wedding journey
            </p>

            <h1 className="max-w-sm font-serif text-5xl leading-[1.15]">
              {isVendorSignIn
                ? "Your craft, beautifully booked."
                : isSignUp
                  ? "Your beautiful story starts here."
                  : "Welcome back to your story."}
            </h1>

            <p className="mt-6 max-w-sm text-sm leading-7 text-white/70">
              {isVendorSignIn
                ? "Manage your services and wedding bookings with grace, all in one place."
                : isSignUp
                  ? "Discover trusted wedding professionals and bring every detail of your celebration together."
                  : "Pick up where you left off and keep your wedding plans moving beautifully."}
            </p>
          </div>

          <div className="relative border-t border-white/20 pt-6">
            <p className="font-serif text-xl italic text-white/90">
              Every detail. One beautiful beginning.
            </p>
            <p className="mt-2 text-xs tracking-wider text-white/50">
              WEDPLAN · PLAN WITH LOVE
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-12 md:py-16">
          <div className="w-full max-w-[390px]">
            <div className="mb-9 md:hidden">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
                <Heart size={22} />
              </div>
              <p className="font-serif text-3xl font-semibold text-foreground">
                WedPlan<span className="text-primary">.</span>
              </p>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
                {isVendorSignIn
                  ? "Vendor access"
                  : isSignUp
                    ? "Create your account"
                    : "Welcome back"}
              </p>

              <h2 className="font-serif text-4xl text-foreground">
                {isVendorSignIn
                  ? "Welcome Back, Vendor"
                  : isSignUp
                    ? "Join WedPlan"
                    : "Sign in"}
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted">
                {isVendorSignIn
                  ? "Sign in to manage your business, services, and wedding bookings."
                  : isSignUp
                    ? "Create an account to start planning your celebration."
                    : "Sign in to continue planning your special day."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-semibold text-foreground transition-all hover:border-accent hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>
            {isSignUp && (
              <p className="mt-2 text-center text-[11px] text-muted">
                Google accounts are created with the Customer role.
              </p>
            )}

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted">OR CONTINUE WITH EMAIL</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <fieldset>
                  <legend className="mb-2 block text-sm font-semibold text-foreground">
                    Account type
                  </legend>
                  <div className="grid grid-cols-2 gap-3">
                    {REGISTRATION_ROLES.map((option) => {
                      const selected = role === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setRole(option)}
                          className={`rounded-xl border px-4 py-3 text-left transition-all ${
                            selected
                              ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                              : "border-border bg-background hover:border-accent"
                          }`}
                        >
                          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                selected ? "bg-primary" : "bg-border"
                              }`}
                            />
                            {option === "customer" ? "Customer" : "Vendor"}
                          </span>
                          <span className="mt-1 block text-[11px] leading-4 text-muted">
                            {option === "customer"
                              ? "Plan your celebration"
                              : "Offer your services"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {fieldErrors.role && (
                    <p className="mt-2 text-xs text-error">{fieldErrors.role}</p>
                  )}
                </fieldset>
              )}

              {isSignUp && (
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-foreground">
                    Full name
                  </label>
                  <div className="relative">
                    <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      minLength={2}
                      maxLength={100}
                      className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="mt-2 text-xs text-error">{fieldErrors.name}</p>
                  )}
                </div>
              )}

              {isSignUp && (
                <div>
                  <label htmlFor="profileImage" className="mb-2 block text-sm font-semibold text-foreground">
                    Profile image <span className="font-normal text-muted">(optional)</span>
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                      className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-xs text-foreground outline-none transition-all file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  </div>
                  {fieldErrors.image && (
                    <p className="mt-2 text-xs text-error">{fieldErrors.image}</p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-foreground">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-2 text-xs text-error">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-foreground">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={isSignUp ? 6 : 1}
                    maxLength={128}
                    className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-12 text-sm text-foreground outline-none transition-all placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-primary"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-2 text-xs text-error">{fieldErrors.password}</p>
                )}
                {isSignUp && !fieldErrors.password && (
                  <p className="mt-2 text-xs text-muted">
                    Use at least 6 characters with one uppercase and one lowercase letter.
                  </p>
                )}
                {!isSignUp && (
                  <div className="mt-2 flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                )}
              </div>

              {error && (
                <div role="alert" className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                  {error}
                  {showRoleMismatch && (
                    <Link
                      href="/sign-in"
                      className="ml-1 font-semibold underline underline-offset-2"
                    >
                      Go to Customer Sign In
                    </Link>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {isSignUp
                      ? "Create account"
                      : isVendorSignIn
                        ? "Sign In as Vendor"
                        : "Sign in"}
                    <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {isVendorSignIn ? (
              <>
                <p className="mt-8 text-center text-sm text-muted">
                  Don&apos;t have a vendor account?{" "}
                  <Link
                    href="/sign-up?role=vendor"
                    className="font-semibold text-primary transition-colors hover:text-primary-hover"
                  >
                    Join WedPlan
                  </Link>
                </p>
                <p className="mt-2 text-center text-sm text-muted">
                  <Link
                    href="/sign-in"
                    className="font-semibold text-primary transition-colors hover:text-primary-hover"
                  >
                    Back to Customer Sign In
                  </Link>
                </p>
              </>
            ) : (
              <div className="mt-8 space-y-2 text-center text-sm text-muted">
                <p>
                  {isSignUp ? "Already have an account?" : "New to WedPlan?"}{" "}
                  <Link
                    href={isSignUp ? "/sign-in" : "/sign-up"}
                    className="font-semibold text-primary transition-colors hover:text-primary-hover"
                  >
                    {isSignUp ? "Sign in" : "Create an account"}
                  </Link>
                </p>
                {!isSignUp && (
                  <p className="text-xs">
                    Are you a wedding vendor?{" "}
                    <Link
                      href="/vendor/sign-in"
                      className="font-semibold text-primary transition-colors hover:text-primary-hover hover:underline underline-offset-2"
                    >
                      Sign in as Vendor
                    </Link>
                  </p>
                )}
              </div>
            )}

            <p className="mt-8 text-center text-xs leading-5 text-muted/80">
              By continuing, you agree to WedPlan&apos;s Terms of Service and Privacy Policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
