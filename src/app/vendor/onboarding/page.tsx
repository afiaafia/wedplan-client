import type { Metadata } from "next";
import { redirect } from "next/navigation";
import VendorOnboardingForm from "@/components/auth/vendor-onboarding-form";
import { requireSession } from "@/lib/auth-server";
import { getRoleDashboard, hasRole } from "@/lib/roles";

export const instant = false;

export const metadata: Metadata = {
  title: "Vendor Onboarding",
  description: "Activate Vendor access on your existing WedPlan account.",
};

export default async function VendorOnboardingPage() {
  const { user } = await requireSession("/vendor/onboarding");

  if (hasRole(user.roles, "admin", user.role)) {
    redirect(getRoleDashboard(user.role, user.roles));
  }

  if (hasRole(user.roles, "vendor", user.role)) {
    redirect("/dashboard/vendor");
  }

  if (!hasRole(user.roles, "customer", user.role)) {
    redirect(getRoleDashboard(user.role, user.roles));
  }

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 pb-16 pt-28 sm:px-6">
      <VendorOnboardingForm />
    </main>
  );
}
