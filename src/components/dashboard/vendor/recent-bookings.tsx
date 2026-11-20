import { CalendarClock, UserRound } from "lucide-react";
import DashboardSection from "./dashboard-section";
import {
  formatBookingStatus,
  formatEventDate,
  type VendorBooking,
} from "@/lib/vendor-dashboard";

type RecentBookingsProps = {
  bookings: VendorBooking[];
};

export default function RecentBookings({ bookings }: RecentBookingsProps) {
  return (
    <DashboardSection
      icon={<CalendarClock size={19} />}
      title="Recent Bookings"
      description="The latest inquiries and confirmed dates for your services."
    >
      {bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background/40 px-6 py-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
            <CalendarClock size={22} />
          </span>
          <h3 className="mt-4 font-serif text-lg text-foreground">
            No bookings to show
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            Booking records are not available through an authorized vendor API
            yet. Customer details, service names, event dates, and statuses will
            appear here once that endpoint is connected.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-champagne" />
            Placeholder state — no sample data
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="flex flex-col gap-3 rounded-xl border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate text-sm font-semibold text-foreground">
                  <UserRound size={15} className="shrink-0 text-accent" />
                  {booking.customerName || "Customer details not shared"}
                </p>
                <p className="mt-1 truncate text-xs text-muted">
                  {booking.serviceName}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-secondary px-3 py-1.5 font-medium text-muted">
                  {formatEventDate(booking.eventDate)}
                </span>
                <span className="rounded-full border border-border px-3 py-1.5 font-semibold text-primary">
                  {formatBookingStatus(booking.status)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
