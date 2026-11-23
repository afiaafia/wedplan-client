import type { Metadata } from "next";
import { requireSession } from "@/lib/auth-server";
import { normalizeRoles } from "@/lib/roles";
import DashboardEntry from "@/components/dashboard/dashboard-entry";

export const instant = false;

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your WedPlan account.",
};

export default async function DashboardPage() {
  const session = await requireSession("/dashboard");
  return (
    <DashboardEntry
      sessionId={session.session.id}
      roles={normalizeRoles(session.user.roles, session.user.role)}
    />
  );
}
