import BusinessSummary from "./business-summary";
import DashboardHeader from "./dashboard-header";
import MyServices from "./my-services";
import OverviewStats from "./overview-stats";
import QuickActions from "./quick-actions";
import RecentBookings from "./recent-bookings";
import SubscriptionCard from "./subscription-card";
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
    <div>
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
  );
}
