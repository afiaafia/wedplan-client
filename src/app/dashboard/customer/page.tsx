import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CustomerOverviewStats from "@/components/dashboard/customer/customer-overview-stats";
import CustomerQuickActions from "@/components/dashboard/customer/customer-quick-actions";
import CustomerRecentBookings from "@/components/dashboard/customer/customer-recent-bookings";
import { getCustomerDashboardForServer } from "@/lib/customer-api-server";

export const instant = false;

export const metadata: Metadata = {
  title: "Customer Dashboard",
  description: "Track your wedding bookings on WedPlan.",
};

export default async function CustomerDashboardPage() {
  const dashboard = await getCustomerDashboardForServer();

  if (!dashboard.ok && (dashboard.code === "UNAUTHORIZED" || dashboard.status === 401)) {
    redirect("/sign-in?redirect=/dashboard/customer");
  }

  const error = dashboard.ok
    ? null
    : {
        message: dashboard.message,
        code: dashboard.code,
        status: dashboard.status,
      };

  return (
    <div className="space-y-8">
      <CustomerOverviewStats
        stats={dashboard.ok ? dashboard.data.stats : null}
        error={error}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        <CustomerRecentBookings
          bookings={dashboard.ok ? dashboard.data.bookings : []}
          error={error}
        />
        <CustomerQuickActions />
      </div>
    </div>
  );
}
