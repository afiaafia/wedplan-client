import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-server";
import VendorPageShell from "@/components/dashboard/vendor/vendor-page-shell";
import VendorSubscriptionClient from "@/components/dashboard/vendor/vendor-subscription-client";

export const instant = false;

export const metadata: Metadata = {
  title: "Subscription",
  description: "Manage your WedPlan vendor subscription.",
};

export default async function VendorSubscriptionPage() {
  await requireRole(["vendor"]);

  return (
    <VendorPageShell
      eyebrow="Vendor workspace"
      title="Subscription"
      description="Compare plans, review your current subscription status, and upgrade when you are ready."
    >
      <VendorSubscriptionClient />
    </VendorPageShell>
  );
}
