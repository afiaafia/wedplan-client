import { CalendarClock, MapPin, UserRound } from "lucide-react";
import DashboardDataError from "./dashboard-data-error";
import DashboardSection from "./dashboard-section";
import {
  formatBookingStatus,
  formatEventDate,
  resolveBookingServiceName,
  type VendorBooking,
  type VendorOverviewError,
  type VendorService,
} from "@/lib/vendor-dashboard";

type RecentBookingsProps = {
  bookings: VendorBooking[];
  services: VendorService[];
  error: VendorOverviewError;
};

export default function RecentBookings({
  bookings,
  services,
  error,
}: RecentBookingsProps) {
  return (
    <DashboardSection
      id="recent-bookings"
      icon={<CalendarClock size={19} />}
      title="Recent Bookings"
      description="The latest inquiries and confirmed dates for your services."
    >
      {error ? (
        <DashboardDataError error={error} title="Bookings are unavailable" compact />
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background/40 px-6 py-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
            <CalendarClock size={22} />
          </span>
          <h3 className="mt-4 font-serif text-lg text-foreground">
            No bookings to show
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            You have no bookings yet. New inquiries for your services will appear
            here automatically.
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
                  Customer details not shared
                </p>
                <p className="mt-1 truncate text-xs text-muted">
                  {resolveBookingServiceName(booking.serviceId, services)}
                </p>
                {booking.eventLocation && (
                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted">
                    <MapPin size={13} className="shrink-0" />
                    {booking.eventLocation}
                  </p>
                )}
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
