import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth-server";
import { getRoleDashboard } from "@/lib/roles";

export const instant = false;

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your WedPlan account.",
};

export default async function DashboardPage() {
  const session = await requireSession("/dashboard");
  redirect(getRoleDashboard(session.user.role));
}
