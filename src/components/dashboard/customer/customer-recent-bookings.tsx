import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, MapPin, UserRound } from "lucide-react";
import DashboardSection from "@/components/dashboard/vendor/dashboard-section";
import BookingStatusBadge from "./booking-status-badge";
import CustomerDataError from "./customer-data-error";
import {
  formatEventDate,
  serviceDisplayName,
  vendorDisplayName,
  type CustomerBooking,
} from "@/lib/customer-dashboard";

type CustomerRecentBookingsProps = {
  bookings: CustomerBooking[];
  error: { message: string; code: string; status: number } | null;
};

export default function CustomerRecentBookings({
  bookings,
  error,
}: CustomerRecentBookingsProps) {
  return (
    <DashboardSection
      icon={<CalendarDays size={19} />}
      title="Recent requests"
      description="Your latest booking requests and where they stand."
      action={
        <Link
          href="/dashboard/customer/bookings"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          View all bookings
          <ArrowRight size={14} />
        </Link>
      }
    >
      {error ? (
        <CustomerDataError error={error} title="Recent bookings are unavailable" compact />
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background/40 px-6 py-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
            <CalendarDays size={22} />
          </span>
          <h3 className="mt-4 font-serif text-lg text-foreground">
            No requests yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            When you request a wedding service, its status and details will
            appear here.
          </p>
          <Link
            href="/services"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Browse services
            <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/dashboard/customer/bookings/${booking.id}`}
              className="group flex flex-col gap-4 rounded-xl border border-border/70 bg-background/60 p-4 transition-colors hover:border-accent/50 hover:bg-secondary/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary text-primary">
                  {booking.service?.image ? (
                    <Image
                      src={booking.service.image}
                      alt=""
                      width={56}
                      height={56}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <CalendarDays size={20} />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {serviceDisplayName(booking.service)}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted">
                    <UserRound size={13} className="shrink-0" />
                    {vendorDisplayName(booking.vendor)}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted">
                    <MapPin size={13} className="shrink-0" />
                    {booking.eventLocation || "Venue to be confirmed"}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted">
                  {formatEventDate(booking.eventDate)}
                </span>
                 <BookingStatusBadge status={booking.status} />
                 <span className="text-xs font-semibold text-primary">View details</span>
                 <ArrowRight
                   size={16}
                  className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
