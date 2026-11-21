"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, Check, Loader2, X } from "lucide-react";
import { useToast } from "@/components/layout/toast-provider";
import {
  getVendorBooking,
  processVendorBooking,
} from "@/lib/vendor-api";
import type { VendorBookingView } from "@/lib/vendor-dashboard";
import { formatBookingStatus, formatEventDate } from "@/lib/vendor-dashboard";

export default function VendorBookingDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [booking, setBooking] = useState<VendorBookingView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getVendorBooking(id, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setBooking(data);
      })
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load this booking."
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  async function process(action: "accept" | "reject") {
    if (
      !window.confirm(
        `Are you sure you want to ${action} this booking request?`
      )
    ) {
      return;
    }

    setBusy(true);
    try {
      const updated = await processVendorBooking(id, action);
      setBooking(updated);
      showToast({
        title: action === "accept" ? "Booking accepted" : "Booking rejected",
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
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted">
        <Loader2 size={16} className="animate-spin" /> Loading booking…
      </p>
    );
  }

  if (error || !booking) {
    return (
      <div role="alert" className="flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
        <AlertCircle size={16} /> {error ?? "Booking not found."}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne">
            Booking request
          </p>
          <h2 className="mt-2 font-serif text-2xl text-foreground">
            {booking.serviceTitle}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {formatBookingStatus(booking.status)} · {formatEventDate(booking.eventDate)}
          </p>
        </div>
        <Link
          href="/dashboard/vendor/bookings"
          className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-primary"
        >
          Back to bookings
        </Link>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Customer</dt>
          <dd className="mt-1 text-sm text-foreground">{booking.customer.name}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Location</dt>
          <dd className="mt-1 text-sm text-foreground">
            {booking.eventLocation || "Not provided"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-wide text-muted">Message</dt>
          <dd className="mt-1 text-sm leading-6 text-foreground">
            {booking.message || "No message was included."}
          </dd>
        </div>
      </dl>

      {booking.status === "Pending" && (
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void process("accept")}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Check size={15} /> Accept request
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void process("reject")}
            className="inline-flex items-center gap-1.5 rounded-full border border-error/40 px-4 py-2 text-sm font-semibold text-error disabled:opacity-60"
          >
            <X size={15} /> Reject request
          </button>
        </div>
      )}
    </div>
  );
}
