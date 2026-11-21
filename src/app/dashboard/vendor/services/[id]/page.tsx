import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-server";
import { resolveVendorPlan } from "@/lib/subscription";
import { getVendorDashboardForServer } from "@/lib/vendor-api-server";
import VendorPageShell from "@/components/dashboard/vendor/vendor-page-shell";
import VendorServiceEditorClient from "@/components/dashboard/vendor/vendor-service-editor-client";

export const instant = false;

export const metadata: Metadata = {
  title: "Edit Service",
  description: "Update a WedPlan service listing.",
};

export default async function EditVendorServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireRole(["vendor"]);
  const { id } = await params;
  const plan = resolveVendorPlan(user.subscriptionPlan, user.subscriptionExpiresAt);
  const dashboard = await getVendorDashboardForServer();
  const activeServices = dashboard.ok
    ? dashboard.overview.stats.activeServices
    : null;

  return (
    <VendorPageShell
      eyebrow="Vendor workspace"
      title="Edit service"
      description="Changes to important details send an approved service back for admin review. Availability is managed from My Services."
    >
      <VendorServiceEditorClient
        id={id}
        plan={plan}
        activeServices={activeServices}
      />
    </VendorPageShell>
  );
}
