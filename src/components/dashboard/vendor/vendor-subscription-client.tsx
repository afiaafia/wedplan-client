"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/layout/toast-provider";
import { getVendorSubscription } from "@/lib/vendor-api";
import type { VendorSubscriptionSummary } from "@/lib/vendor-dashboard";
import {
  CheckoutApiError,
  createCheckoutSession,
} from "@/lib/subscriptions-api";

const PREMIUM_FEATURES = [
  "Unlimited active service listings",
  "Full access to vendor booking tools",
  "Priority placement in vendor results",
];

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  expired: "Expired",
  pending: "Awaiting payment confirmation",
  failed: "Payment failed",
  cancelled: "Cancelled",
  none: "Not started",
};

function formatDate(value: string | null): string {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export default function VendorSubscriptionClient() {
  const { showToast } = useToast();
  const checkoutInFlight = useRef(false);
  const [summary, setSummary] = useState<VendorSubscriptionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const load = useCallback(async (signal?: AbortSignal, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await getVendorSubscription(signal);
      if (!signal?.aborted) {
        setSummary(data);
        setError(null);
      }
    } catch (loadError) {
      if (!signal?.aborted) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load subscription details."
        );
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) void load(controller.signal);
    });
    return () => controller.abort();
  }, [load]);

  async function upgrade() {
    if (checkoutInFlight.current || starting) return;

    checkoutInFlight.current = true;
    setStarting(true);

    try {
      const url = await createCheckoutSession();
      window.location.assign(url);
    } catch (upgradeError) {
      if (upgradeError instanceof CheckoutApiError) {
        if (upgradeError.code === "PREMIUM_ALREADY_ACTIVE") {
          await load(undefined, true);
        }
        showToast({
          title:
            upgradeError.code === "PREMIUM_ALREADY_ACTIVE"
              ? "Premium is already active"
              : "Unable to start checkout",
          description: upgradeError.message,
          variant: "error",
        });
      } else {
        showToast({
          title: "Unable to start checkout",
          description: "Please try again in a moment.",
          variant: "error",
        });
      }
      checkoutInFlight.current = false;
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm">
        <p className="flex items-center gap-2 text-sm text-muted">
          <Loader2 size={16} className="animate-spin" /> Loading subscription…
        </p>
      </section>
    );
  }

  if (error || !summary) {
    return (
      <section
        role="alert"
        className="rounded-2xl border border-error/30 bg-error/10 p-6 shadow-sm"
      >
        <div className="flex items-start gap-2 text-sm text-error">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error ?? "Subscription details are unavailable."}</span>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <RefreshCw size={14} /> Try again
        </button>
      </section>
    );
  }

  const isPremium = summary.plan === "premium";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
                Current plan
              </p>
              <h2 className="mt-2 font-serif text-3xl capitalize text-foreground">
                {summary.plan}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {isPremium
                  ? "Unlimited active listings and continued access to every vendor tool."
                  : "Free plan supports up to 3 active service listings at a time."}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${
                isPremium
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-border bg-secondary text-primary"
              }`}
            >
              {isPremium ? <CheckCircle2 size={13} /> : null}
              {STATUS_LABELS[summary.status] ?? summary.status}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-background/60 p-4">
              <p className="text-xs text-muted">Active services</p>
              <p className="mt-1 font-serif text-2xl text-foreground">
                {summary.activeServices}
                {summary.activeServiceLimit !== null
                  ? ` / ${summary.activeServiceLimit}`
                  : ""}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 p-4">
              <p className="text-xs text-muted">Subscription started</p>
              <p className="mt-1 text-sm text-foreground">
                {formatDate(summary.startedAt)}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 p-4">
              <p className="text-xs text-muted">Expires / renews</p>
              <p className="mt-1 text-sm text-foreground">
                {formatDate(summary.expiresAt)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-serif text-xl text-foreground">Payment history</h3>
            <button
              type="button"
              onClick={() => void load(undefined, true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-foreground disabled:opacity-60"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Refresh status
            </button>
          </div>

          {summary.recentTransactions.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
              No payments have been recorded for this account yet.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-130 text-left text-xs">
                <thead className="text-muted">
                  <tr className="border-b border-border/70">
                    <th className="py-2 font-medium">Date</th>
                    <th className="py-2 font-medium">Amount</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-border/40 last:border-0"
                    >
                      <td className="py-3 text-foreground">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="py-3 text-foreground">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </td>
                      <td className="py-3 capitalize text-foreground">
                        {transaction.status}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-muted">
                        {transaction.stripeSessionId ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <aside className="h-fit rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <h3 className="font-serif text-xl text-foreground">WedPlan Premium</h3>
        <p className="mt-2 text-xs leading-5 text-muted">
          {summary.price
            ? `${formatAmount(summary.price.amount, summary.price.currency)} / ${summary.price.interval}`
            : "Monthly subscription"}
        </p>
        <ul className="mt-4 space-y-2 text-xs leading-5 text-muted">
          {PREMIUM_FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-primary" />
              {feature}
            </li>
          ))}
        </ul>

        {isPremium ? (
          <p className="mt-5 rounded-xl bg-card px-3 py-2.5 text-center text-sm font-semibold text-primary">
            Premium active — no upgrade needed
          </p>
        ) : summary.checkoutAvailable ? (
          <button
            type="button"
            disabled={starting}
            aria-busy={starting}
            onClick={() => void upgrade()}
            className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {starting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Creating checkout…
              </>
            ) : (
              <>
                Upgrade to Premium <ArrowUpRight size={15} />
              </>
            )}
          </button>
        ) : (
          <p className="mt-5 rounded-xl bg-card px-3 py-2.5 text-center text-xs leading-5 text-muted">
            Checkout is not configured yet. Contact support to upgrade.
          </p>
        )}

        <p className="mt-3 text-[11px] leading-5 text-muted">
          Premium is activated only after Stripe confirms payment to our backend.
        </p>
        <Link
          href="/dashboard/vendor"
          className="mt-4 inline-block text-xs font-semibold text-primary underline underline-offset-2"
        >
          Back to vendor dashboard
        </Link>
      </aside>
    </div>
  );
}
