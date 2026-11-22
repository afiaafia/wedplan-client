"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  Eye,
  EyeOff,
  Heart,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { getSession, signIn, signOut } from "@/lib/auth-client";
import { authErrorMessage, authQueryErrorMessage } from "@/lib/auth-errors";
import { useToast } from "@/components/layout/toast-provider";
import VendorAccessConfirmation from "@/components/auth/vendor-access-confirmation";
import { getSafeRedirectPath } from "@/lib/redirect-path";
import {
  isAllowedPostAuthDestination,
  isAllowedPostAuthRedirect,
} from "@/lib/route-access";
import { getRoleDashboard, normalizeRoles } from "@/lib/roles";
import { getVendorSignInDisposition } from "@/lib/vendor-auth";
import {
  finishGoogleOAuthFlow,
  startGoogleOAuthFlow,
} from "@/lib/google-oauth-flow";

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

export default function VendorSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [roleMismatch, setRoleMismatch] = useState(false);
  const [showActivationConfirmation, setShowActivationConfirmation] =
    useState(false);

  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const error = formError || authQueryErrorMessage(errorParam, errorDescription);
  const showRoleMismatch = roleMismatch || errorParam === "not_vendor";

  useEffect(() => {
    if (errorParam) finishGoogleOAuthFlow();
  }, [errorParam]);

  async function handlePostSignInVerification() {
    const sessionResult = await getSession();
    const user = sessionResult.data?.user;

    if (!user) {
      setFormError("We could not verify your session. Please try again.");
      showToast({
        title: "Sign in failed",
        description: "We could not verify your session. Please try again.",
        variant: "error",
      });
      return;
    }

    if (user.isBlocked === true) {
      await signOut();
      setFormError("This account has been blocked. Please contact support.");
      showToast({
        title: "Account Blocked",
        description: "This account has been blocked. Please contact support.",
        variant: "error",
      });
      return;
    }

    const userRoles = normalizeRoles(user.roles, user.role);
    const disposition = getVendorSignInDisposition(userRoles);

    if (disposition === "activate-vendor") {
      setShowActivationConfirmation(true);
      return;
    }

    if (disposition === "admin") {
      router.replace(getRoleDashboard("admin"));
      router.refresh();
      return;
    }

    if (disposition !== "vendor") {
      await signOut();
      setRoleMismatch(true);
      setFormError("This account is not authorized to access the Vendor Dashboard.");
      return;
    }

    const requestedPath = getSafeRedirectPath(
      searchParams.get("redirect"),
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000"
    );

    const target =
      requestedPath && isAllowedPostAuthRedirect(requestedPath, "vendor")
        ? requestedPath
        : getRoleDashboard("vendor");

    showToast({
      title: "Signed in",
      description: `Welcome back${user.name ? `, ${user.name}` : ""}.`,
      variant: "success",
    });

    router.replace(target);
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || googleLoading) return;

    setFormError("");
    setFieldErrors({});
    setRoleMismatch(false);
    setShowActivationConfirmation(false);

    const errors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Please enter your password.";
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
      const result = await signIn.email({
        email: trimmedEmail,
        password,
        rememberMe: true,
      });

      if (result.error) {
        const message = authErrorMessage(result.error);
        setFormError(message);
        showToast({
          title: "Sign in failed",
          description: message,
          variant: "error",
        });
        return;
      }

      await handlePostSignInVerification();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setFormError(message);
      showToast({
        title: "Authentication failed",
        description: message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (loading || googleLoading) return;

    setFormError("");
    setRoleMismatch(false);
    const flowLock = startGoogleOAuthFlow();
    if (flowLock !== "started") {
      setFormError(
        flowLock === "pending"
          ? "A Google sign-in is already in progress in another tab. Complete it or wait for it to expire."
          : "Google sign-in requires browser storage. Enable site storage and try again."
      );
      return;
    }
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

      const callbackPath = `/vendor/auth/callback${
        destination ? `?redirect=${encodeURIComponent(destination)}` : ""
      }`;

      const result = await signIn.social({
        provider: "google",
        additionalData: {
          role: "vendor",
        },
        callbackURL: getFrontendUrl(callbackPath),
        errorCallbackURL: getFrontendUrl("/vendor/sign-in"),
      });

      if (result?.error) {
        finishGoogleOAuthFlow();
        const message = authErrorMessage(result.error);
        setFormError(message);
        showToast({
          title: "Google sign-in failed",
          description: message,
          variant: "error",
        });
      }
    } catch (err) {
      finishGoogleOAuthFlow();
      const message =
        err instanceof Error ? err.message : "Google authentication failed.";
      setFormError(message);
      showToast({
        title: "Google sign-in failed",
        description: message,
        variant: "error",
      });
    } finally {
      setGoogleLoading(false);
    }
  }

  if (showActivationConfirmation) {
    return <VendorAccessConfirmation source="email" />;
  }

  return (
    <main className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden bg-secondary/35 px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      {/* Decorative ambient background glows */}
      <div
        className="pointer-events-none absolute -left-28 top-28 h-80 w-80 rounded-full bg-accent/10 blur-[110px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-20 h-96 w-96 rounded-full bg-champagne/15 blur-[120px]"
        aria-hidden="true"
      />

      {/* Centered elevated vendor authentication card */}
      <div className="relative z-10 w-full max-w-[460px] rounded-[32px] border border-border/80 bg-card p-7 shadow-[0_20px_70px_rgba(48,39,42,0.08)] sm:p-10">
        {/* Brand heart icon */}
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
          <Heart size={26} strokeWidth={1.8} className="fill-white/10" aria-hidden="true" />
        </div>

        {/* Clear visual indicator that this is the Vendor sign-in page */}
        <div className="mb-3 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Briefcase size={13} strokeWidth={2.2} aria-hidden="true" />
            <span>Vendor Sign-In</span>
          </span>
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Welcome Back, Vendor
          </h1>
          <p className="mt-2.5 text-sm leading-6 text-muted">
            Sign in to manage your wedding services and bookings.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          {/* Email Address */}
          <div>
            <label
              htmlFor="vendor-email"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                size={18}
                aria-hidden="true"
              />
              <input
                id="vendor-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                required
                disabled={loading || googleLoading}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "vendor-email-error" : undefined}
                className={`h-12 w-full rounded-xl border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                  fieldErrors.email
                    ? "border-error focus:border-error focus:ring-error/10"
                    : "border-border hover:border-accent/60"
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p
                id="vendor-email-error"
                className="mt-2 text-xs font-medium text-error"
              >
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="vendor-password"
                className="text-sm font-semibold text-foreground"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <LockKeyhole
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                size={18}
                aria-hidden="true"
              />
              <input
                id="vendor-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                required
                disabled={loading || googleLoading}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? "vendor-password-error" : undefined
                }
                className={`h-12 w-full rounded-xl border bg-background pl-11 pr-12 text-sm text-foreground outline-none transition-all placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                  fieldErrors.password
                    ? "border-error focus:border-error focus:ring-error/10"
                    : "border-border hover:border-accent/60"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || googleLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p
                id="vendor-password-error"
                className="mt-2 text-xs font-medium text-error"
              >
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-error/25 bg-error/5 p-4 text-sm text-error"
            >
              <p>{error}</p>
              {showRoleMismatch && (
                <p className="mt-2">
                  <Link
                    href="/sign-in"
                    className="font-semibold underline underline-offset-2 hover:text-error/80"
                  >
                    Go to Customer Sign In &rarr;
                  </Link>
                </p>
              )}
            </div>
          )}

          {/* Primary CTA */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In as Vendor</span>
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            OR CONTINUE WITH
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-semibold text-foreground shadow-sm transition-all hover:border-accent hover:bg-secondary/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading ? (
            <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
          ) : (
            <GoogleIcon />
          )}
          <span>Continue with Google as Vendor</span>
        </button>

        {/* Bottom Prompts */}
        <div className="mt-8 space-y-2.5 text-center text-sm text-muted">
          <p>
            New to WedPlan?{" "}
            <Link
              href="/sign-up?role=vendor"
              className="font-semibold text-primary transition-colors hover:text-primary-hover hover:underline underline-offset-2"
            >
              Become a Vendor
            </Link>
          </p>

          <p>
            Already have a Customer account?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-primary transition-colors hover:text-primary-hover hover:underline underline-offset-2"
            >
              Sign in and activate Vendor access
            </Link>
          </p>

          <p className="text-xs">
            Planning a celebration instead?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-muted transition-colors hover:text-primary hover:underline underline-offset-2"
            >
              Sign in as a Customer
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
