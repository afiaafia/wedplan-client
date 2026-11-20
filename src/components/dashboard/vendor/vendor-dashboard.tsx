import BusinessSummary from "./business-summary";
import DashboardHeader from "./dashboard-header";
import MyServices from "./my-services";
import OverviewStats from "./overview-stats";
import QuickActions from "./quick-actions";
import RecentBookings from "./recent-bookings";
import VendorSidebar from "./vendor-sidebar";
import type { VendorOverview } from "@/lib/vendor-dashboard";

type VendorDashboardProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
    businessName?: string | null;
  };
  currentDate: string;
  overview: VendorOverview;
};

export default function VendorDashboard({
  user,
  currentDate,
  overview,
}: VendorDashboardProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute left-[-200px] top-40 h-96 w-96 rounded-full bg-accent/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-[-120px] h-96 w-96 rounded-full bg-champagne/15 blur-[120px]" />

      <VendorSidebar businessName={user.businessName} />

      <main className="relative z-10 px-4 pb-16 pt-[168px] sm:px-6 lg:pl-[320px] lg:pr-8 lg:pt-32">
        <div className="mx-auto max-w-[1400px]">
          <DashboardHeader
            name={user.name}
            email={user.email}
            currentDate={currentDate}
          />

          <div className="space-y-8">
            <OverviewStats stats={overview.stats} />

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
              <div className="space-y-6">
                <MyServices services={overview.services} />
                <RecentBookings bookings={overview.bookings} />
              </div>

              <div className="space-y-6">
                <QuickActions />
                <BusinessSummary
                  name={user.name}
                  email={user.email}
                  image={user.image}
                  businessName={user.businessName}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
