import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CustomerDataError from "@/components/dashboard/customer/customer-data-error";
import CustomerProfileSettings from "@/components/dashboard/customer/customer-profile-settings";
import { getCustomerProfileForServer } from "@/lib/customer-api-server";

export const instant = false;

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Update your WedPlan customer profile.",
};

export default async function CustomerSettingsPage() {
  const profile = await getCustomerProfileForServer();

  if (!profile.ok && (profile.code === "UNAUTHORIZED" || profile.status === 401)) {
    redirect("/sign-in?redirect=/dashboard/customer/settings");
  }

  if (!profile.ok) {
    return (
      <CustomerDataError
        error={{
          message: profile.message,
          code: profile.code,
          status: profile.status,
        }}
        title="Your profile is temporarily unavailable"
      />
    );
  }

  return <CustomerProfileSettings profile={profile.data} />;
}
