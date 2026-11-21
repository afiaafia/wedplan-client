"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Eye,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import {
  getAdminBooking,
  getAdminBookings,
  type AdminBooking,
} from "@/lib/admin-api";
import { formatEventDate, getInitials } from "@/lib/vendor-dashboard";
import { useToast } from "@/components/layout/toast-provider";

const PAGE_SIZE = 10;

const BOOKING_STATUSES = [
  { value: "Pending", label: "Pending" },
  { value: "Accepted", label: "Accepted" },
  { value: "Rejected", label: "Rejected" },
  { value: "Cancelled", label: "Cancelled" },
];

export default function AdminBookingsClient() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [page, setPage] = useState(1);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [meta, setMeta] = useState<{ page: number; totalPages: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [detail, setDetail] = useState<AdminBooking | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAdminBookings(
          {
            q: search.trim() || undefined,
            status: status || undefined,
            serviceId: serviceId || undefined,
            customerId: customerId || undefined,
            vendorId: vendorId || undefined,
            page,
            limit: PAGE_SIZE,
          },
          signal
        );
        if (signal?.aborted) return;
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
    },
    [customerId, page, search, serviceId, status, vendorId]
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => void load(controller.signal),
      search ? 300 : 0
    );
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [load, nonce, search]);

  useEffect(() => {
    queueMicrotask(() => setPage(1));
  }, [search, status, serviceId, customerId, vendorId]);

  async function openDetail(id: string) {
    setDetailLoading(true);
    try {
      setDetail(await getAdminBooking(id));
    } catch (detailError) {
      showToast({
        title: "Unable to load booking",
        description:
          detailError instanceof Error ? detailError.message : "Please try again.",
      });
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card/80 p-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search bookings"
          aria-label="Search bookings"
          className="min-w-[220px] flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by booking status"
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <input
          value={serviceId}
          onChange={(event) => setServiceId(event.target.value)}
          placeholder="Service ID"
          aria-label="Filter by service ID"
          className="w-40 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <input
          value={customerId}
          onChange={(event) => setCustomerId(event.target.value)}
          placeholder="Customer ID"
          aria-label="Filter by customer ID"
          className="w-40 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <input
          value={vendorId}
          onChange={(event) => setVendorId(event.target.value)}
          placeholder="Vendor ID"
          aria-label="Filter by vendor ID"
          className="w-40 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => setNonce((value) => value + 1)}
          aria-label="Refresh bookings"
          className="rounded-xl border border-border p-2.5 text-muted transition hover:text-primary"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80">
        {loading && bookings.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" /> Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-muted">
            No bookings match these filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Requested</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border/60">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {booking.serviceTitle}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-secondary text-[10px] font-semibold text-primary">
                          {booking.customer.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={booking.customer.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getInitials(booking.customer.name)
                          )}
                        </span>
                        <span className="text-muted">{booking.customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{booking.vendor.name}</td>
                    <td className="px-4 py-3 text-muted">
                      {formatEventDate(booking.eventDate)}
                      <span className="block text-xs">
                        {booking.eventLocation || "Location TBC"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatEventDate(booking.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold capitalize text-primary">
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => void openDetail(booking.id)}
                        aria-label={`View booking ${booking.id}`}
                        className="rounded-lg border border-border p-2 text-muted transition hover:text-primary"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} bookings
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-border px-3 py-1.5 font-semibold disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-border px-3 py-1.5 font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {detailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-4 backdrop-blur-sm">
          <div className="rounded-2xl bg-card p-8 shadow-xl">
            <Loader2 size={20} className="mx-auto animate-spin text-primary" />
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-booking-detail-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border/70 bg-card p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="admin-booking-detail-title"
                  className="font-serif text-2xl text-foreground"
                >
                  {detail.serviceTitle}
                </h2>
                <p className="mt-1 text-xs text-muted capitalize">
                  Booking status: {detail.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                aria-label="Close booking details"
                className="rounded-lg p-1.5 text-muted hover:bg-secondary"
              >
                <X size={18} />
              </button>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <DetailRow label="Customer" value={detail.customer.name} />
              <DetailRow label="Customer ID" value={detail.customer.id} />
              <DetailRow label="Vendor" value={detail.vendor.name} />
              <DetailRow
                label="Event date"
                value={formatEventDate(detail.eventDate)}
              />
              <DetailRow
                label="Location"
                value={detail.eventLocation || "To be confirmed"}
              />
              <DetailRow
                label="Requested"
                value={formatEventDate(detail.createdAt)}
              />
            </dl>
            {detail.message && (
              <div className="mt-5 rounded-xl bg-secondary/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Customer message
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                  {detail.message}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="mt-6 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-2 last:border-0">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
