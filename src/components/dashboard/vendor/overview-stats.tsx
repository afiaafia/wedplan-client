import { CalendarCheck, Clock3, Layers3, Store } from "lucide-react";
import DashboardDataError from "./dashboard-data-error";
import StatCard from "./stat-card";
import type {
  VendorOverviewError,
  VendorOverviewStats,
} from "@/lib/vendor-dashboard";

type OverviewStatsProps = {
  stats: VendorOverviewStats;
  error: VendorOverviewError;
};

export default function OverviewStats({ stats, error }: OverviewStatsProps) {
  const cards = [
    {
      label: "Total Services",
      icon: <Store size={19} />,
      value: stats.totalServices,
      hint: "All service listings on your account.",
    },
    {
      label: "Active Services",
      icon: <Layers3 size={19} />,
      value: stats.activeServices,
      hint: "Listings currently visible to couples.",
    },
    {
      label: "Pending Approval",
      icon: <Clock3 size={19} />,
      value: stats.pendingApproval,
      hint: "Listings awaiting WedPlan review.",
    },
    {
      label: "Total Bookings",
      icon: <CalendarCheck size={19} />,
      value: stats.totalBookings,
      hint: "Booking count across your services.",
    },
    {
      label: "Pending Requests",
      icon: <Clock3 size={19} />,
      value: stats.pendingBookingRequests ?? null,
      hint: "Booking requests waiting for your response.",
    },
    {
      label: "Accepted Bookings",
      icon: <CalendarCheck size={19} />,
      value: stats.acceptedBookings ?? null,
      hint: "Requests you have accepted.",
    },
  ];

  return (
    <section aria-labelledby="overview-stats-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
            At a glance
          </p>
          <h2 id="overview-stats-heading" className="mt-2 font-serif text-2xl text-foreground">
            Overview statistics
          </h2>
        </div>
        <p className="max-w-sm text-xs leading-5 text-muted">
          Live figures from your vendor account. No estimated numbers are shown.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <DashboardDataError
            error={error}
            title="Dashboard statistics are unavailable"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </section>
  );
}
