import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { getDashboardEntryPath, normalizeRoles } from "@/lib/roles";
import AuthForm from "@/components/auth/auth-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your WedPlan account and start planning.",
};

export default async function SignUpPage() {
  const session = await getServerSession();
  if (session) {
    redirect(
      getDashboardEntryPath(
        normalizeRoles(session.user.roles, session.user.role)
      )
    );
  }

  return <AuthForm mode="sign-up" />;
}
