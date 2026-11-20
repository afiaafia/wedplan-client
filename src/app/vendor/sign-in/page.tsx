import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { getRoleDashboard } from "@/lib/roles";
import AuthForm from "@/components/auth/auth-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Vendor Sign In",
  description: "Sign in to manage your WedPlan vendor business and bookings.",
};

export default async function VendorSignInPage() {
  const session = await getServerSession();
  if (session) {
    redirect(getRoleDashboard(session.user.role));
  }

  return <AuthForm mode="sign-in" audience="vendor" />;
}
