import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-server";
import AdminPageShell from "@/components/dashboard/admin/admin-page-shell";
import AdminTransactionsClient from "@/components/dashboard/admin/admin-transactions-client";

export const instant = false;

export const metadata: Metadata = {
  title: "Transactions",
  description: "Review WedPlan subscription payment records.",
};

export default async function AdminTransactionsPage() {
  await requireRole(["admin"]);

  return (
    <AdminPageShell
      eyebrow="Administration"
      title="Transactions"
      description="Inspect verified subscription payment records, filter by status or vendor, and reconcile premium upgrades."
    >
      <AdminTransactionsClient />
    </AdminPageShell>
  );
}
