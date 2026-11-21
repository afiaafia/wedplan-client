"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Check, Loader2, RefreshCw, X } from "lucide-react";
import { useToast } from "@/components/layout/toast-provider";
import {
  getVendorBookings,
  processVendorBooking,
  type VendorBookingQuery,
} from "@/lib/vendor-api";
import type { PaginationMeta, VendorBookingView } from "@/lib/vendor-dashboard";
import { formatBookingStatus, formatEventDate } from "@/lib/vendor-dashboard";

const STATUSES = ["Pending", "Accepted", "Rejected", "Cancelled"] as const;

export default function VendorBookingsClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const [query, setQuery] = useState<VendorBookingQuery>({
    status: undefined,
    page: 1,
    limit: 10,
  });
  const [bookings, setBookings] = useState<VendorBookingView[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getVendorBookings(query, signal);
      setBookings(result.items);
      setMeta(result.meta);
    } catch (loadError) {
      if (signal?.aborted) return;
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load bookings."
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      void load(controller.signal);
    });
    return () => controller.abort();
  }, [load]);

  async function process(booking: VendorBookingView, action: "accept" | "reject") {
    const label = action === "accept" ? "accept" : "reject";
    if (
      !window.confirm(
        `${label.charAt(0).toUpperCase()}${label.slice(1)} the booking request for "${booking.serviceTitle}" from ${booking.customer.name}?`
      )
    ) {
      return;
    }

    setBusyId(booking.id);
    try {
      const updated = await processVendorBooking(booking.id, action);
      setBookings((current) =>
        current.map((item) => (item.id === booking.id ? updated : item))
      );
      showToast({
        title: action === "accept" ? "Booking accepted" : "Booking rejected",
        description: `${booking.serviceTitle} · ${booking.customer.name}`,
      });
      router.refresh();
    } catch (processError) {
      showToast({
        title: "Unable to update booking",
        description:
          processError instanceof Error ? processError.message : undefined,
        variant: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl text-foreground">Booking requests</h2>
          <p className="mt-1 text-xs text-muted">
            Respond to couples and keep your calendar up to date.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={query.status ?? ""}
            onChange={(event) =>
              setQuery((current) => ({
                ...current,
                status: event.target.value || undefined,
                page: 1,
              }))
            }
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted transition hover:text-primary"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 px-3.5 py-3 text-xs text-error"
        >
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted">
          <Loader2 size={16} className="animate-spin" /> Loading booking requests…
        </p>
      ) : bookings.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          No booking requests match this filter yet.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="rounded-xl border border-border/70 bg-background/60 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">
                      {booking.serviceTitle}
                    </p>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      {formatBookingStatus(booking.status)}
                    </span>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                    {booking.customer.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={booking.customer.image}
                        alt=""
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    )}
                    <span>{booking.customer.name}</span>
                    <span>· Event {formatEventDate(booking.eventDate)}</span>
                    <span>· Requested {formatEventDate(booking.createdAt)}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {booking.eventLocation || "Location to be confirmed"}
                  </p>
                  {booking.message && (
                    <p className="mt-2 text-xs leading-5 text-muted">
                      “{booking.message}”
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/vendor/bookings/${booking.id}`}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-primary"
                  >
                    Details
                  </Link>
                  {booking.status === "Pending" && (
                    <>
                      <button
                        type="button"
                        disabled={busyId === booking.id}
                        onClick={() => void process(booking, "accept")}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        <Check size={13} /> Accept
                      </button>
                      <button
                        type="button"
                        disabled={busyId === booking.id}
                        onClick={() => void process(booking, "reject")}
                        className="inline-flex items-center gap-1.5 rounded-full border border-error/40 px-3 py-1.5 text-xs font-semibold text-error disabled:opacity-60"
                      >
                        <X size={13} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-xs text-muted">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} requests
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!meta.hasPreviousPage}
              onClick={() =>
                setQuery((current) => ({ ...current, page: meta.page - 1 }))
              }
              className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!meta.hasNextPage}
              onClick={() =>
                setQuery((current) => ({ ...current, page: meta.page + 1 }))
              }
              className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
