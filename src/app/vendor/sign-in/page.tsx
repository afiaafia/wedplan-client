import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { getRoleDashboard, normalizeRoles } from "@/lib/roles";
import { getVendorSignInDisposition } from "@/lib/vendor-auth";
import VendorAccessConfirmation from "@/components/auth/vendor-access-confirmation";
import VendorSignInForm from "@/components/auth/vendor-sign-in-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Vendor Sign In",
  description: "Sign in to manage your WedPlan vendor business and bookings.",
};

export default async function VendorSignInPage() {
  const session = await getServerSession();
  if (session) {
    if (session.user.isBlocked === true) {
      redirect("/blocked");
    }
    const roles = normalizeRoles(session.user.roles, session.user.role);
    const disposition = getVendorSignInDisposition(roles);
    if (disposition === "vendor") redirect(getRoleDashboard("vendor"));
    if (disposition === "admin") redirect(getRoleDashboard("admin"));
    if (disposition === "activate-vendor") {
      return <VendorAccessConfirmation source="account" />;
    }
    redirect(getRoleDashboard(session.user.role, session.user.roles));
  }

  return <VendorSignInForm />;
}
