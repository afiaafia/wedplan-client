import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { requireRole } from "@/lib/auth-server";
import { RoleDashboard } from "@/components/dashboard/role-dashboard";
import RetryCheckoutButton from "@/components/dashboard/vendor/retry-checkout-button";

export const instant = false;

export const metadata: Metadata = {
  title: "Checkout cancelled",
  description: "Your WedPlan Premium checkout was cancelled.",
};

export default async function PaymentCancelPage() {
  const { user } = await requireRole(["vendor"]);

  return (
    <>
      <RoleDashboard
        user={user}
        eyebrow="Vendor workspace"
        title="Checkout cancelled"
        description="No payment was completed, and your plan has not changed."
        cards={[
          {
            icon: <XCircle size={22} />,
            title: "Subscription",
            description: "Review your current plan and payment history.",
            href: "/dashboard/vendor/subscription",
          },
        ]}
      />
      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <section className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <XCircle size={22} className="mt-0.5 shrink-0 text-champagne" />
            <div>
              <h2 className="font-serif text-xl text-foreground">
                Checkout was cancelled
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                You remain on the Free plan. No charge was made and Premium was not
                activated. If the Checkout session expired, you can safely start a
                new one.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <RetryCheckoutButton />
            <Link
              href="/dashboard/vendor/subscription"
              className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Back to subscription
            </Link>
            <Link
              href="/dashboard/vendor"
              className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Vendor dashboard
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
