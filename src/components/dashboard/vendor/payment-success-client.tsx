"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { getVendorSubscription } from "@/lib/vendor-api";

const MAX_ATTEMPTS = 5;
const RETRY_DELAYS_MS = [1500, 2500, 4000, 6000];

type VerificationState = "checking" | "confirmed" | "pending" | "error";

export default function PaymentSuccessClient({
  sessionId,
}: {
  sessionId: string | null;
}) {
  const cancelled = useRef(false);
  const verifyRef = useRef<(currentAttempt: number) => Promise<void>>(
    async () => {}
  );
  const [state, setState] = useState<VerificationState>("checking");
  const [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const verify = useCallback(async (currentAttempt: number) => {
    setState("checking");
    setAttempt(currentAttempt);

    try {
      const summary = await getVendorSubscription();

      if (cancelled.current) return;

      if (summary.plan === "premium" && summary.status === "active") {
        setState("confirmed");
        setMessage(null);
        return;
      }

      if (currentAttempt >= MAX_ATTEMPTS) {
        setState("pending");
        setMessage(null);
        return;
      }

      const delay = RETRY_DELAYS_MS[currentAttempt - 1] ?? 2000;
      window.setTimeout(() => void verifyRef.current(currentAttempt + 1), delay);
    } catch (error) {
      if (cancelled.current) return;

      if (currentAttempt >= MAX_ATTEMPTS) {
        setState("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "We could not confirm your subscription right now."
        );
        return;
      }

      const delay = RETRY_DELAYS_MS[currentAttempt - 1] ?? 2000;
      window.setTimeout(() => void verifyRef.current(currentAttempt + 1), delay);
    }
  }, []);

  useEffect(() => {
    verifyRef.current = verify;
    cancelled.current = false;
    queueMicrotask(() => void verify(1));
    return () => {
      cancelled.current = true;
    };
  }, [verify]);

  return (
    <section
      aria-live="polite"
      className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm"
    >
      {state === "checking" && (
        <div className="flex items-start gap-3">
          <Loader2 size={22} className="mt-0.5 shrink-0 animate-spin text-primary" />
          <div>
            <h2 className="font-serif text-xl text-foreground">
              Confirming your payment
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              We are checking your subscription status with the backend. Premium is
              only shown after Stripe&apos;s payment webhook has been verified.
            </p>
            <p className="mt-2 text-xs text-muted">Check {attempt} of {MAX_ATTEMPTS}</p>
          </div>
        </div>
      )}

      {state === "confirmed" && (
        <div className="flex items-start gap-3">
          <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-success" />
          <div>
            <h2 className="font-serif text-xl text-foreground">
              Payment confirmed — Premium is active
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Your backend subscription record confirms Premium access. Unlimited
              active services are now available in your vendor dashboard.
            </p>
          </div>
        </div>
      )}

      {state === "pending" && (
        <div className="flex items-start gap-3">
          <Clock3 size={22} className="mt-0.5 shrink-0 text-champagne" />
          <div>
            <h2 className="font-serif text-xl text-foreground">
              Payment submitted — verification still pending
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Your redirect alone does not confirm payment. We have not received a
              verified webhook yet. Premium will appear automatically once the
              backend confirms it, usually within a few minutes.
            </p>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="flex items-start gap-3" role="alert">
          <AlertCircle size={22} className="mt-0.5 shrink-0 text-error" />
          <div>
            <h2 className="font-serif text-xl text-foreground">
              We could not check your status
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {message ?? "Please try again in a moment."}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void verify(1)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          <RefreshCw size={15} /> Check status again
        </button>
        <Link
          href="/dashboard/vendor/subscription"
          className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          View subscription
        </Link>
        <Link
          href="/dashboard/vendor"
          className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          Vendor dashboard
        </Link>
      </div>

      {sessionId && (
        <p className="mt-4 text-[11px] text-muted">
          Checkout reference: <span className="font-mono">{sessionId}</span>
        </p>
      )}
    </section>
  );
}
