import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-server";
import AdminPageShell from "@/components/dashboard/admin/admin-page-shell";
import AdminServicesClient from "@/components/dashboard/admin/admin-services-client";

export const instant = false;

export const metadata: Metadata = {
  title: "Manage Services",
  description: "Review and moderate WedPlan service listings.",
};

export default async function AdminServicesPage() {
  await requireRole(["admin"]);

  return (
    <AdminPageShell
      eyebrow="Administration"
      title="Manage services"
      description="Review pending listings, approve or reject submissions with a reason, manage availability, and remove policy violations."
    >
      <AdminServicesClient />
    </AdminPageShell>
  );
}
