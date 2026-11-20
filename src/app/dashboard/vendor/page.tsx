import type { Metadata } from "next";
import VendorDashboard from "@/components/dashboard/vendor/vendor-dashboard";
import { requireRole } from "@/lib/auth-server";
import { EMPTY_VENDOR_OVERVIEW } from "@/lib/vendor-dashboard";

export const instant = false;

export const metadata: Metadata = {
  title: "Vendor Dashboard",
  description: "Manage your wedding business on WedPlan.",
};

export default async function VendorDashboardPage() {
  const { user } = await requireRole(["vendor"]);

  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <VendorDashboard
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
        businessName: user.businessName,
      }}
      currentDate={currentDate}
      overview={EMPTY_VENDOR_OVERVIEW}
    />
  );
}
