import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, MapPin } from "lucide-react";
import {
  formatBookingDate,
  type BookingConfirmation as BookingConfirmationData,
} from "@/lib/bookings-api";
import type { ServiceDetail } from "@/lib/services-api";

export default function BookingConfirmation({
  booking,
  service,
}: {
  booking: BookingConfirmationData;
  service: ServiceDetail;
}) {
  return (
    <div className="mt-6" role="status">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/15 text-success">
        <CheckCircle2 size={24} />
      </div>

      <h3 className="mt-4 font-serif text-2xl text-foreground">
        Request sent
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted">
        Your request for{" "}
        <span className="font-semibold text-foreground">
          {booking.serviceTitle || service.title}
        </span>{" "}
        is now pending vendor approval.
      </p>

      <div className="mt-5 space-y-3 rounded-2xl bg-secondary/70 p-4">
        <p className="flex items-start gap-2.5 text-sm text-foreground">
          <CalendarDays size={16} className="mt-0.5 shrink-0 text-accent" />
          <span>{formatBookingDate(booking.eventDate)}</span>
        </p>
        <p className="flex items-start gap-2.5 text-sm text-foreground">
          <MapPin size={16} className="mt-0.5 shrink-0 text-accent" />
          <span className="wrap-break-word">{booking.eventLocation}</span>
        </p>
        <p className="flex items-start gap-2.5 text-sm text-foreground">
          <Clock3 size={16} className="mt-0.5 shrink-0 text-accent" />
          <span>Status: Pending vendor approval</span>
        </p>
      </div>

      <Link
        href="/dashboard/customer/bookings"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        View my bookings
        <ArrowRight size={16} />
      </Link>

      <p className="mt-3 text-center text-[11px] leading-5 text-muted">
        You can review this request any time from My Bookings in your customer
        dashboard.
      </p>
    </div>
  );
}
