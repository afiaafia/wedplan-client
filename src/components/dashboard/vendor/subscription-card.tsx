"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Crown,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";
import { getSession } from "@/lib/auth-client";
import { normalizeRole, type UserRole } from "@/lib/roles";
import {
  formatServiceUsage,
  FREE_PLAN_LIMIT_MESSAGE,
  FREE_SERVICE_LIMIT,
  getServiceLimit,
  isActiveServiceLimitReached,
  PREMIUM_PRICE_LABEL,
  resolveVendorPlan,
  type VendorPlan,
} from "@/lib/subscription";
import {
  CheckoutApiError,
  createCheckoutSession,
} from "@/lib/subscriptions-api";

const MAX_VERIFY_ATTEMPTS = 4;
const RETRY_DELAYS_MS = [1500, 2500, 4000];

type RedirectStatus = "success" | "cancelled" | null;

type FeedbackTone = "success" | "pending" | "info" | "error";

type Feedback = {
  tone: FeedbackTone;
  title: string;
  message: string;
  showSignIn?: boolean;
};

type SubscriptionCardProps = {
  role: UserRole;
  plan: VendorPlan;
  activeServices: number | null;
  redirectStatus: RedirectStatus;
};

type SessionSnapshot = {
  user?: {
    role?: unknown;
    subscriptionPlan?: unknown;
    subscriptionExpiresAt?: unknown;
  };
};

const feedbackStyles: Record<FeedbackTone, string> = {
  success: "border-success/30 bg-success/10 text-success",
  pending: "border-champagne/30 bg-champagne/10 text-champagne",
  info: "border-border bg-secondary/70 text-primary",
  error: "border-error/30 bg-error/10 text-error",
};

function readSession(response: unknown): SessionSnapshot | null {
  let value = response;

  if (value && typeof value === "object" && "data" in value) {
    value = (value as { data?: unknown }).data;
  }

  if (!value || typeof value !== "object") return null;

  const user = (value as { user?: unknown }).user;
  if (!user || typeof user !== "object") return null;

  return { user: user as SessionSnapshot["user"] };
}

function initialRedirectFeedback(
  redirectStatus: RedirectStatus,
  role: UserRole
): Feedback | null {
  if (role !== "vendor" || !redirectStatus) return null;

  if (redirectStatus === "cancelled") {
    return {
      tone: "info",
      title: "Checkout cancelled",
      message:
        "No charge was made. You can upgrade to Premium whenever you're ready.",
    };
  }

  return {
    tone: "pending",
    title: "Verifying your subscription",
    message:
      "Your payment was submitted. We're confirming it with Stripe before activating Premium.",
  };
}

export default function SubscriptionCard({
  role,
  plan,
  activeServices,
  redirectStatus,
}: SubscriptionCardProps) {
  const router = useRouter();
  const checkoutInFlight = useRef(false);
  const [previousPlan, setPreviousPlan] = useState<VendorPlan>(plan);
  const [currentPlan, setCurrentPlan] = useState<VendorPlan>(plan);
  const [feedback, setFeedback] = useState<Feedback | null>(() =>
    initialRedirectFeedback(redirectStatus, role)
  );
  const [checkoutError, setCheckoutError] = useState<Feedback | null>(null);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  if (previousPlan !== plan) {
    setPreviousPlan(plan);
    setCurrentPlan(plan);
  }

  useEffect(() => {
    if (!redirectStatus || role !== "vendor") return;

    let cancelled = false;
    let timer: number | undefined;

    const clearRedirectParams = () => {
      const params = new URLSearchParams(window.location.search);
      params.delete("subscription");
      params.delete("session_id");
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}`
      );
    };

    if (redirectStatus === "cancelled") {
      clearRedirectParams();
      return;
    }

    const verify = async (attempt: number) => {
      try {
        const snapshot = readSession(await getSession());

        if (cancelled) return;

        if (!snapshot) {
          setFeedback({
            tone: "error",
            title: "Session expired",
            message: "Please sign in again to confirm your subscription.",
            showSignIn: true,
          });
          clearRedirectParams();
          return;
        }

        const user = snapshot.user;

        if (normalizeRole(user?.role) !== "vendor") {
          setFeedback({
            tone: "error",
            title: "Vendor access required",
            message: "Only vendor accounts can manage WedPlan Premium.",
          });
          clearRedirectParams();
          return;
        }

        const confirmedPlan = resolveVendorPlan(
          user?.subscriptionPlan,
          user?.subscriptionExpiresAt
        );

        if (confirmedPlan === "premium") {
          setCurrentPlan("premium");
          setFeedback({
            tone: "success",
            title: "Premium is active",
            message:
              "Your subscription is confirmed. Unlimited active services are now available.",
          });
          clearRedirectParams();
          router.refresh();
          return;
        }

        if (attempt >= MAX_VERIFY_ATTEMPTS) {
          setFeedback({
            tone: "pending",
            title: "Still confirming",
            message:
              "Stripe hasn't confirmed the subscription yet. Premium will appear here automatically once confirmation completes. You can refresh this page later.",
          });
          clearRedirectParams();
          return;
        }

        timer = window.setTimeout(
          () => void verify(attempt + 1),
          RETRY_DELAYS_MS[attempt - 1] ?? 2000
        );
      } catch {
        if (cancelled) return;

        if (attempt >= MAX_VERIFY_ATTEMPTS) {
          setFeedback({
            tone: "error",
            title: "Couldn't verify right now",
            message:
              "Refresh this page in a moment. Premium is only shown after backend confirmation.",
          });
          clearRedirectParams();
          return;
        }

        timer = window.setTimeout(
          () => void verify(attempt + 1),
          RETRY_DELAYS_MS[attempt - 1] ?? 2000
        );
      }
    };

    void verify(1);

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [redirectStatus, role, router]);

  if (role !== "vendor") return null;

  const isPremium = currentPlan === "premium";
  const limit = getServiceLimit(currentPlan);

  async function handleUpgrade() {
    if (checkoutInFlight.current || isCreatingCheckout) return;

    checkoutInFlight.current = true;
    setIsCreatingCheckout(true);
    setCheckoutError(null);

    try {
      const checkoutUrl = await createCheckoutSession();
      window.location.assign(checkoutUrl);
    } catch (error) {
      checkoutInFlight.current = false;
      setIsCreatingCheckout(false);

      if (error instanceof CheckoutApiError) {
        setCheckoutError({
          tone: "error",
          title: "Checkout couldn't start",
          message: error.message,
          showSignIn: error.code === "UNAUTHORIZED",
        });
        return;
      }

      setCheckoutError({
        tone: "error",
        title: "Checkout couldn't start",
        message: "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <section
      aria-labelledby="subscription-heading"
      className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
            Subscription
          </p>
          <h2
            id="subscription-heading"
            className="mt-2 font-serif text-xl text-foreground"
          >
            Your plan
          </h2>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${
            isPremium
              ? "border-success/30 bg-success/10 text-success"
              : "border-border bg-secondary text-primary"
          }`}
        >
          {isPremium ? <Crown size={13} /> : <Sparkles size={13} />}
          {isPremium ? "Premium" : "Free"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 rounded-xl border border-border/70 bg-background/60 p-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted">Current plan</span>
          <span className="font-semibold text-foreground">
            {isPremium ? "Premium" : "Free"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted">Premium price</span>
          <span className="font-semibold text-foreground">
            {PREMIUM_PRICE_LABEL}
          </span>
        </div>
        <div className="border-t border-border/70 pt-3">
          <p className="text-xs font-medium text-muted">Active services</p>
          <p className="mt-1 font-semibold text-foreground">
            {formatServiceUsage(activeServices, currentPlan)}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            {isPremium
              ? "Premium removes the free-plan active-service limit."
              : `Free includes ${limit ?? FREE_SERVICE_LIMIT} active services.`}
          </p>
        </div>
      </div>

      {!isPremium && isActiveServiceLimitReached(activeServices, currentPlan) && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 flex items-start gap-2.5 rounded-xl border border-champagne/30 bg-champagne/10 px-3.5 py-3 text-xs leading-5 text-champagne"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>{FREE_PLAN_LIMIT_MESSAGE}</p>
        </div>
      )}

      {feedback && (
        <div
          role={feedback.tone === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`mt-4 flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs leading-5 ${feedbackStyles[feedback.tone]}`}
        >
          {feedback.tone === "error" ? (
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
          ) : feedback.tone === "success" ? (
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          ) : (
            <Info size={16} className="mt-0.5 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-semibold">{feedback.title}</p>
            <p className="mt-0.5 opacity-90">{feedback.message}</p>
            {feedback.showSignIn && (
              <Link
                href="/sign-in?redirect=/dashboard/vendor"
                className="mt-2 inline-flex items-center gap-1 font-semibold underline underline-offset-2"
              >
                Sign in again
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>
      )}

      {checkoutError && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-xl border border-error/30 bg-error/10 px-3.5 py-3 text-xs leading-5 text-error"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold">{checkoutError.title}</p>
            <p className="mt-0.5 opacity-90">{checkoutError.message}</p>
            {checkoutError.showSignIn && (
              <Link
                href="/sign-in?redirect=/dashboard/vendor"
                className="mt-2 inline-flex items-center gap-1 font-semibold underline underline-offset-2"
              >
                Sign in again
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>
      )}

      {isPremium ? (
        <div className="mt-5 flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-3 text-xs font-semibold text-success">
          <CheckCircle2 size={16} />
          Premium active — no upgrade needed
        </div>
      ) : (
        <button
          type="button"
          onClick={handleUpgrade}
          disabled={isCreatingCheckout}
          aria-busy={isCreatingCheckout}
          className="group mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isCreatingCheckout ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Creating checkout…
            </>
          ) : (
            <>
              <Crown size={17} />
              Upgrade to Premium
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </>
          )}
        </button>
      )}

      <p className="mt-3 text-[11px] leading-5 text-muted">
        Secure checkout powered by Stripe. Premium activates only after payment
        is confirmed.
      </p>
    </section>
  );
}
