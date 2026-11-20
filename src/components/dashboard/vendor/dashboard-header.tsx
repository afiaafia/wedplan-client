import { CalendarDays, Plus } from "lucide-react";
import { getFirstName } from "@/lib/vendor-dashboard";

type DashboardHeaderProps = {
  name: string;
  email: string;
  currentDate: string;
};

export default function DashboardHeader({
  name,
  email,
  currentDate,
}: DashboardHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
            Vendor dashboard
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-medium text-muted">
            <CalendarDays size={13} className="text-accent" />
            {currentDate}
          </span>
        </div>

        <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
          Welcome back,{" "}
          <span className="text-primary">{getFirstName(name)}</span>.
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
          Keep your wedding business moving beautifully. Review your services,
          upcoming bookings, and account details in one calm place.
        </p>
        <p className="mt-2 text-xs text-muted/80">Signed in as {email}</p>
      </div>

      <button
        type="button"
        disabled
        title="Service creation is planned for a later milestone"
        className="group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-80"
      >
        <Plus size={17} />
        Add New Service
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          Soon
        </span>
      </button>
    </header>
  );
}
