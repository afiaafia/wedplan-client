"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  RefreshCw,
  UserRound,
} from "lucide-react";
import BookingStatusBadge from "./booking-status-badge";
import CancelBookingButton from "./cancel-booking-button";
import {
  getCustomerBooking,
  messageForCustomerApiError,
} from "@/lib/customer-api";
import {
  formatCustomerPrice,
  formatEventDate,
  formatRequestDate,
  serviceDisplayName,
  vendorDisplayName,
  type CustomerBooking,
} from "@/lib/customer-dashboard";

export default function CustomerBookingDetails({ bookingId }: { bookingId: string }) {
  const [booking, setBooking] = useState<CustomerBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadBooking = useCallback(
    async (signal: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getCustomerBooking(bookingId, { signal });
        if (signal.aborted) return;
        setBooking(result);
      } catch (loadError) {
        if (signal.aborted) return;
        setError(messageForCustomerApiError(loadError));
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    },
    [bookingId]
  );

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      void loadBooking(controller.signal);
    });
    return () => controller.abort();
  }, [loadBooking, refreshKey]);

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard/customer/bookings"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-primary"
      >
        <ArrowLeft size={15} />
        Back to my bookings
      </Link>

      {isLoading ? (
        <div
          aria-busy="true"
          className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card/80 px-5 py-10 text-sm text-muted"
        >
          <Loader2 size={16} className="animate-spin" />
          Loading booking details...
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-error/30 bg-error/10 px-5 py-8 text-error">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">We couldn&apos;t load this booking</p>
              <p className="mt-1 text-xs leading-5 opacity-90">{error}</p>
              <button
                type="button"
                onClick={() => setRefreshKey((value) => value + 1)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-error/40 px-3 py-1.5 text-xs font-semibold hover:bg-error/10"
              >
                <RefreshCw size={13} />
                Try again
              </button>
            </div>
          </div>
        </div>
      ) : booking ? (
        <>
          <section className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
                  Booking details
                </p>
                <h2 className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
                  {serviceDisplayName(booking.service)}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Requested {formatRequestDate(booking.createdAt)}
                </p>
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/60 p-4">
                <CalendarDays size={18} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Event date
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {formatEventDate(booking.eventDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/60 p-4">
                <MapPin size={18} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Venue
                  </p>
                  <p className="mt-1 break-words text-sm font-medium text-foreground">
                    {booking.eventLocation || "To be confirmed"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/60 p-4">
                <Clock3 size={18} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Last updated
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {formatRequestDate(booking.updatedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/60 p-4">
                <UserRound size={18} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Vendor
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {vendorDisplayName(booking.vendor)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border/70 bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Your message
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                {booking.message || "No additional details were provided."}
              </p>
            </div>

            {booking.status === "Pending" && (
              <div className="mt-6 flex justify-end">
                <CancelBookingButton
                  bookingId={booking.id}
                  onCancelled={(updated) => setBooking(updated)}
                />
              </div>
            )}
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
                Service
              </p>
              <div className="mt-4 flex gap-4">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary text-primary">
                  {booking.service?.image ? (
                    <img
                      src={booking.service.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <CalendarDays size={24} />
                  )}
                </span>
                <div className="min-w-0">
                  <h3 className="font-serif text-xl text-foreground">
                    {serviceDisplayName(booking.service)}
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    {booking.service?.category || "Category unavailable"}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-primary">
                    {formatCustomerPrice(booking.service?.price ?? null)}
                  </p>
                </div>
              </div>
              {booking.service && (
                <Link
                  href={`/services/${booking.service.id}`}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
                >
                  View service listing
                  <ArrowLeft size={14} className="rotate-180" />
                </Link>
              )}
            </section>

            <section className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
                Vendor
              </p>
              <div className="mt-4 flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-semibold text-primary">
                  {booking.vendor?.profileImage ? (
                    <img
                      src={booking.vendor.profileImage}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (booking.vendor?.name || "V")[0].toUpperCase()
                  )}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-serif text-xl text-foreground">
                    {vendorDisplayName(booking.vendor)}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                    <Mail size={13} />
                    Contact details shared after acceptance
                  </p>
                </div>
              </div>
              <p className="mt-5 text-xs leading-5 text-muted">
                Your vendor reviews the request and updates its status here.
              </p>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
