import { CalendarCheck2, CalendarClock, CheckCircle2, XCircle } from "lucide-react";
import StatCard from "@/components/dashboard/vendor/stat-card";
import CustomerDataError from "./customer-data-error";
import type { CustomerDashboardStats } from "@/lib/customer-dashboard";

type CustomerOverviewStatsProps = {
  stats: CustomerDashboardStats | null;
  error: { message: string; code: string; status: number } | null;
};

export default function CustomerOverviewStats({
  stats,
  error,
}: CustomerOverviewStatsProps) {
  const cards = [
    {
      label: "Total requests",
      icon: <CalendarCheck2 size={19} />,
      value: stats?.totalBookings ?? null,
      hint: "Every booking request you've submitted.",
    },
    {
      label: "Awaiting response",
      icon: <CalendarClock size={19} />,
      value: stats?.pendingBookings ?? null,
      hint: "Requests currently with a vendor.",
    },
    {
      label: "Confirmed",
      icon: <CheckCircle2 size={19} />,
      value: stats?.acceptedBookings ?? null,
      hint: "Vendors who accepted your request.",
    },
    {
      label: "Declined",
      icon: <XCircle size={19} />,
      value: stats?.rejectedBookings ?? null,
      hint: "Requests a vendor could not accept.",
    },
  ];

  return (
    <section aria-labelledby="customer-stats-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
            At a glance
          </p>
          <h2
            id="customer-stats-heading"
            className="mt-2 font-serif text-2xl text-foreground"
          >
            Your booking overview
          </h2>
        </div>
        <p className="max-w-sm text-xs leading-5 text-muted">
          Live figures from your WedPlan account. No estimated numbers are shown.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <CustomerDataError
            error={error}
            title="Your overview is unavailable"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </section>
  );
}
