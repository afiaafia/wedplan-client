import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth-server";
import VendorPageShell from "@/components/dashboard/vendor/vendor-page-shell";
import VendorServicesClient from "@/components/dashboard/vendor/vendor-services-client";
import { getVendorDashboardForServer } from "@/lib/vendor-api-server";

export const instant = false;

export const metadata: Metadata = {
  title: "My Services",
  description: "Manage your WedPlan service listings.",
};

export default async function VendorServicesPage() {
  await requireRole(["vendor"]);
  const dashboard = await getVendorDashboardForServer();
  const activeServices = dashboard.ok
    ? dashboard.overview.stats.activeServices
    : null;

  return (
    <VendorPageShell
      eyebrow="Vendor workspace"
      title="My services"
      description="Review your listings, search and filter them, manage availability, and keep your portfolio up to date."
      action={
        <Link
          href="/dashboard/vendor/services/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-primary-hover"
        >
          <Plus size={16} /> Add New Service
        </Link>
      }
    >
      <VendorServicesClient activeServices={activeServices} />
    </VendorPageShell>
  );
}
