import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { requireRole } from "@/lib/auth-server";
import { RoleDashboard } from "@/components/dashboard/role-dashboard";
import PaymentSuccessClient from "@/components/dashboard/vendor/payment-success-client";

export const instant = false;

export const metadata: Metadata = {
  title: "Payment confirmation",
  description: "Confirm your WedPlan Premium subscription.",
};

type PaymentSuccessPageProps = {
  searchParams: Promise<{ session_id?: string | string[] }>;
};

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const { user } = await requireRole(["vendor"]);
  const query = await searchParams;
  const rawSessionId = Array.isArray(query.session_id)
    ? query.session_id[0]
    : query.session_id;
  const sessionId =
    typeof rawSessionId === "string" && /^cs_[A-Za-z0-9_]+$/.test(rawSessionId)
      ? rawSessionId
      : null;

  return (
    <>
      <RoleDashboard
        user={user}
        eyebrow="Vendor workspace"
        title="Payment confirmation"
        description="Verify that your Premium subscription has been confirmed."
        cards={[
          {
            icon: <CheckCircle2 size={22} />,
            title: "Subscription",
            description: "Review your plan and payment history.",
            href: "/dashboard/vendor/subscription",
          },
        ]}
      />
      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <PaymentSuccessClient sessionId={sessionId} />
      </div>
    </>
  );
}
