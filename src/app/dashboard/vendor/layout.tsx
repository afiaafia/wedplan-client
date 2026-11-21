import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth-server";
import { resolveVendorPlan } from "@/lib/subscription";
import VendorShell from "@/components/dashboard/vendor/vendor-shell";

export const instant = false;

export default async function VendorDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await requireRole(["vendor"]);
  const plan = resolveVendorPlan(user.subscriptionPlan, user.subscriptionExpiresAt);

  return (
    <VendorShell
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
        businessName: user.businessName,
      }}
      plan={plan}
    >
      {children}
    </VendorShell>
  );
}
