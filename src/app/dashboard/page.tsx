import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { getRoleDashboard } from "@/lib/roles";

export const instant = false;

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your WedPlan account.",
};

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  redirect(getRoleDashboard(session.user.role));
}
