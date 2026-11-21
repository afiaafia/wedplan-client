import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-server";
import AdminPageShell from "@/components/dashboard/admin/admin-page-shell";
import AdminBookingsClient from "@/components/dashboard/admin/admin-bookings-client";

export const instant = false;

export const metadata: Metadata = {
  title: "Manage Bookings",
  description: "Monitor WedPlan booking requests across the platform.",
};

export default async function AdminBookingsPage() {
  await requireRole(["admin"]);

  return (
    <AdminPageShell
      eyebrow="Administration"
      title="Manage bookings"
      description="Search and monitor every booking request with customer, vendor, event, and status details."
    >
      <AdminBookingsClient />
    </AdminPageShell>
  );
}
