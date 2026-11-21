import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-server";
import { resolveVendorPlan } from "@/lib/subscription";
import { getVendorDashboardForServer } from "@/lib/vendor-api-server";
import VendorPageShell from "@/components/dashboard/vendor/vendor-page-shell";
import ServiceForm from "@/components/dashboard/vendor/service-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Add New Service",
  description: "Create a new wedding service listing on WedPlan.",
};

export default async function NewVendorServicePage() {
  const { user } = await requireRole(["vendor"]);
  const plan = resolveVendorPlan(user.subscriptionPlan, user.subscriptionExpiresAt);
  const dashboard = await getVendorDashboardForServer();
  const activeServices = dashboard.ok
    ? dashboard.overview.stats.activeServices
    : null;

  return (
    <VendorPageShell
      eyebrow="Vendor workspace"
      title="Add a new service"
      description="Tell couples what you offer. New listings start as pending and are reviewed by an administrator before they appear publicly."
    >
      <ServiceForm mode="create" plan={plan} activeServices={activeServices} />
    </VendorPageShell>
  );
}
