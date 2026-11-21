"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { useToast } from "@/components/layout/toast-provider";
import {
  cancelCustomerBooking,
  messageForCustomerApiError,
} from "@/lib/customer-api";
import type { CustomerBooking } from "@/lib/customer-dashboard";

export default function CancelBookingButton({
  bookingId,
  onCancelled,
}: {
  bookingId: string;
  onCancelled: (booking: CustomerBooking) => void;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const updated = await cancelCustomerBooking(bookingId);
      onCancelled(updated);
      setOpen(false);
      router.refresh();
      showToast({
        title: "Request cancelled",
        description: "Your booking request has been cancelled.",
        variant: "success",
      });
    } catch (cancelError) {
      setError(messageForCustomerApiError(cancelError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="rounded-full border border-error/30 px-3.5 py-2 text-xs font-semibold text-error transition-colors hover:bg-error/10"
      >
        Cancel request
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close cancellation dialog"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-title"
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[0_24px_80px_rgba(48,39,42,0.22)]"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close cancellation dialog"
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X size={17} />
            </button>

            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-error/10 text-error">
              <AlertCircle size={21} />
            </span>
            <h2
              id="cancel-booking-title"
              className="mt-4 font-serif text-2xl text-foreground"
            >
              Cancel this request?
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              The vendor will be notified that you no longer need this service.
              This cannot be undone.
            </p>

            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-secondary hover:text-foreground"
              >
                Keep request
              </button>
              <button
                type="button"
                onClick={() => void handleCancel()}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-full bg-error px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-error/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                {isSubmitting ? "Cancelling..." : "Yes, cancel request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
