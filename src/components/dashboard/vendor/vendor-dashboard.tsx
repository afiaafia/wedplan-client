import BusinessSummary from "./business-summary";
import DashboardHeader from "./dashboard-header";
import MyServices from "./my-services";
import OverviewStats from "./overview-stats";
import QuickActions from "./quick-actions";
import RecentBookings from "./recent-bookings";
import SubscriptionCard from "./subscription-card";
import VendorSidebar from "./vendor-sidebar";
import type { UserRole } from "@/lib/roles";
import type { VendorPlan } from "@/lib/subscription";
import type {
  VendorOverview,
  VendorOverviewError,
  VendorServiceEditorAction,
} from "@/lib/vendor-dashboard";

type VendorDashboardProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
    businessName?: string | null;
  };
  role: UserRole;
  plan: VendorPlan;
  redirectStatus: "success" | "cancelled" | null;
  currentDate: string;
  overview: VendorOverview;
  overviewError: VendorOverviewError;
  editorAction: VendorServiceEditorAction;
};

export default function VendorDashboard({
  user,
  role,
  plan,
  redirectStatus,
  currentDate,
  overview,
  overviewError,
  editorAction,
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
            <OverviewStats stats={overview.stats} error={overviewError} />

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
              <div className="space-y-6">
                <MyServices
                  services={overview.services}
                  plan={plan}
                  activeServices={overview.stats.activeServices}
                  error={overviewError}
                  editorAction={editorAction}
                />
                <RecentBookings
                  bookings={overview.bookings}
                  services={overview.services}
                  error={overviewError}
                />
              </div>

              <div className="space-y-6">
                <SubscriptionCard
                  role={role}
                  plan={plan}
                  activeServices={overview.stats.activeServices}
                  redirectStatus={redirectStatus}
                />
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
