import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-server";
import AdminPageShell from "@/components/dashboard/admin/admin-page-shell";
import AdminUsersClient from "@/components/dashboard/admin/admin-users-client";

export const instant = false;

export const metadata: Metadata = {
  title: "Manage Users",
  description: "Review and manage WedPlan accounts.",
};

export default async function AdminUsersPage() {
  await requireRole(["admin"]);

  return (
    <AdminPageShell
      eyebrow="Administration"
      title="Manage users"
      description="Search accounts, review registrations and activity, and block or unblock users who violate WedPlan policies."
    >
      <AdminUsersClient />
    </AdminPageShell>
  );
}
