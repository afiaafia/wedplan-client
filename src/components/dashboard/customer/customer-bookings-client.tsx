"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  RefreshCw,
  Tag,
  UserRound,
} from "lucide-react";
import BookingStatusBadge from "./booking-status-badge";
import CancelBookingButton from "./cancel-booking-button";
import {
  getCustomerBookings,
  messageForCustomerApiError,
} from "@/lib/customer-api";
import {
  CUSTOMER_BOOKING_FILTERS,
  formatEventDate,
  formatRequestDate,
  serviceDisplayName,
  vendorDisplayName,
  type CustomerBooking,
  type CustomerBookingFilter,
  type CustomerPagination,
} from "@/lib/customer-dashboard";

const filterLabels: Record<CustomerBookingFilter, string> = {
  all: "All",
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

function BookingSkeleton() {
  return (
    <div aria-busy="true" className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-32 animate-pulse rounded-xl border border-border/70 bg-secondary/40"
        />
      ))}
    </div>
  );
}

export default function CustomerBookingsClient() {
  const [filter, setFilter] = useState<CustomerBookingFilter>("all");
  const [page, setPage] = useState(1);
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [pagination, setPagination] = useState<CustomerPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadBookings = useCallback(
    async (signal: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getCustomerBookings(
          { page, status: filter },
          { signal }
        );

        if (signal.aborted) return;
        setBookings(result.bookings);
        setPagination(result.pagination);
      } catch (loadError) {
        if (signal.aborted) return;
        setError(messageForCustomerApiError(loadError));
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    },
    [filter, page]
  );

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      void loadBookings(controller.signal);
    });
    return () => controller.abort();
  }, [loadBookings, refreshKey]);

  function changeFilter(next: CustomerBookingFilter) {
    if (next === filter) return;
    setFilter(next);
    setPage(1);
  }

  return (
    <section className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
            Your requests
          </p>
          <h2 className="mt-2 font-serif text-2xl text-foreground">My Bookings</h2>
        </div>
        {pagination && (
          <p className="text-xs text-muted">
            {pagination.total} {pagination.total === 1 ? "request" : "requests"}
          </p>
        )}
      </div>

      <div
        role="group"
        aria-label="Filter bookings by status"
        className="mt-6 flex flex-wrap gap-2"
      >
        {CUSTOMER_BOOKING_FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => changeFilter(item)}
            aria-pressed={filter === item}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              filter === item
                ? "bg-primary text-white"
                : "border border-border bg-background/60 text-muted hover:bg-secondary hover:text-primary"
            }`}
          >
            {filterLabels[item]}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <BookingSkeleton />
        ) : error ? (
          <div role="alert" className="rounded-xl border border-error/30 bg-error/10 px-5 py-6 text-error">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">We couldn&apos;t load your bookings</p>
                <p className="mt-1 text-xs leading-5 opacity-90">{error}</p>
                <button
                  type="button"
                  onClick={() => setRefreshKey((value) => value + 1)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-error/40 px-3 py-1.5 text-xs font-semibold hover:bg-error/10"
                >
                  <RefreshCw size={13} />
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background/40 px-6 py-12 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
              <CalendarDays size={22} />
            </span>
            <h3 className="mt-4 font-serif text-lg text-foreground">
              No {filter === "all" ? "bookings" : filterLabels[filter].toLowerCase()} to show
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              {filter === "all"
                ? "Your booking requests will appear here after you contact a vendor."
                : "Try a different status filter to see your other requests."}
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
              <article
                key={booking.id}
                className="flex flex-col gap-4 rounded-xl border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between"
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
                      <Tag size={13} className="shrink-0" />
                      {booking.service?.category || "Category unavailable"}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted">
                      <MapPin size={13} className="shrink-0" />
                      {booking.eventLocation || "Venue to be confirmed"}
                    </p>
                    <p className="mt-1 text-[11px] text-muted/80">
                      Requested {formatRequestDate(booking.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                  <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted">
                    {formatEventDate(booking.eventDate)}
                  </span>
                  <BookingStatusBadge status={booking.status} />
                  <Link
                    href={`/dashboard/customer/bookings/${booking.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-secondary"
                  >
                    Details
                    <ArrowRight size={14} />
                  </Link>
                  {booking.status === "Pending" && (
                    <CancelBookingButton
                      bookingId={booking.id}
                      onCancelled={() => setRefreshKey((value) => value + 1)}
                    />
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && !isLoading && !error && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
          <p className="text-xs text-muted">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={!pagination.hasPreviousPage}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted transition-colors hover:bg-secondary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((value) => value + 1)}
              disabled={!pagination.hasNextPage}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted transition-colors hover:bg-secondary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <p className="mt-4 flex items-center gap-2 text-xs text-muted" aria-live="polite">
          <Loader2 size={14} className="animate-spin" />
          Loading your bookings...
        </p>
      )}
    </section>
  );
}
