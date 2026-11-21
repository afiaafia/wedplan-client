import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-server";
import AdminPageShell from "@/components/dashboard/admin/admin-page-shell";
import AdminOverviewClient from "@/components/dashboard/admin/admin-overview-client";

export const instant = false;

export const metadata: Metadata = {
  title: "Admin Overview",
  description: "Platform-wide WedPlan statistics and recent activity.",
};

export default async function AdminDashboardPage() {
  await requireRole(["admin"]);

  return (
    <AdminPageShell
      eyebrow="Administration"
      title="Platform overview"
      description="Monitor registrations, listings, booking activity, subscriptions, and verified payment records across WedPlan."
    >
      <AdminOverviewClient />
    </AdminPageShell>
  );
}
