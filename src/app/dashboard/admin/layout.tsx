import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth-server";
import AdminShell from "@/components/dashboard/admin/admin-shell";

export const instant = false;

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await requireRole(["admin"]);

  return (
    <AdminShell
      user={{ name: user.name, email: user.email, image: user.image }}
    >
      {children}
    </AdminShell>
  );
}
