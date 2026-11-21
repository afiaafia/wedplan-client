"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarDays,
  Loader2,
  MapPin,
  MessageSquareText,
} from "lucide-react";
import { useToast } from "@/components/layout/toast-provider";
import {
  BookingApiError,
  createBookingRequest,
  formatBookingDate,
  messageForBookingError,
  type BookingConfirmation,
} from "@/lib/bookings-api";
import {
  futureDateString,
  validateBookingForm,
  type BookingFormErrors,
  type BookingFormValues,
} from "@/lib/booking-form";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10";

export default function BookingRequestForm({
  serviceId,
  onSuccess,
}: {
  serviceId: string;
  onSuccess: (booking: BookingConfirmation) => void;
}) {
  const { showToast } = useToast();
  const submitting = useRef(false);
  const [values, setValues] = useState<BookingFormValues>({
    eventDate: "",
    eventLocation: "",
    message: "",
  });
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const minDate = futureDateString();

  function update(field: keyof BookingFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    const nextErrors = validateBookingForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitError(null);
      return;
    }

    submitting.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const booking = await createBookingRequest({
        serviceId,
        eventDate: values.eventDate,
        eventLocation: values.eventLocation.trim(),
        message: values.message.trim(),
      });

      showToast({
        variant: "success",
        title: "Booking request sent",
        description: `${booking.serviceTitle} · ${formatBookingDate(booking.eventDate)}`,
      });
      onSuccess(booking);
    } catch (error) {
      if (error instanceof BookingApiError && error.details.length > 0) {
        const apiErrors: BookingFormErrors = {};

        for (const detail of error.details) {
          if (
            detail.field === "eventDate" ||
            detail.field === "eventLocation" ||
            detail.field === "message"
          ) {
            apiErrors[detail.field] = detail.message;
          }
        }

        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors);
        }
      }

      const message = messageForBookingError(error);
      setSubmitError(message);
      showToast({
        variant: "error",
        title: "Request not sent",
        description: message,
      });
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="booking-event-date"
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <CalendarDays size={15} className="text-accent" />
          Event date
        </label>
        <input
          id="booking-event-date"
          type="date"
          min={minDate}
          suppressHydrationWarning
          value={values.eventDate}
          onChange={(event) => update("eventDate", event.target.value)}
          aria-invalid={Boolean(errors.eventDate)}
          aria-describedby={
            errors.eventDate ? "booking-event-date-error" : undefined
          }
          className={fieldClass}
        />
        {errors.eventDate && (
          <p id="booking-event-date-error" className="mt-1 text-xs text-error">
            {errors.eventDate}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="booking-event-location"
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <MapPin size={15} className="text-accent" />
          Event location
        </label>
        <input
          id="booking-event-location"
          type="text"
          placeholder="Venue, city, or address"
          maxLength={150}
          value={values.eventLocation}
          onChange={(event) => update("eventLocation", event.target.value)}
          aria-invalid={Boolean(errors.eventLocation)}
          aria-describedby={
            errors.eventLocation ? "booking-event-location-error" : undefined
          }
          className={fieldClass}
        />
        {errors.eventLocation && (
          <p
            id="booking-event-location-error"
            className="mt-1 text-xs text-error"
          >
            {errors.eventLocation}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="booking-message"
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <MessageSquareText size={15} className="text-accent" />
          Additional message
          <span className="text-xs font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="booking-message"
          rows={4}
          placeholder="Tell the vendor about your celebration, guest count, or any questions."
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "booking-message-error" : undefined}
          className={`${fieldClass} resize-none`}
        />
        {errors.message && (
          <p id="booking-message-error" className="mt-1 text-xs text-error">
            {errors.message}
          </p>
        )}
      </div>

      {submitError && (
        <p
          role="alert"
          className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
        >
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            Sending request...
          </>
        ) : (
          <>
            Send booking request
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </>
        )}
      </button>

      <p className="text-center text-[11px] leading-5 text-muted">
        Your request is pending vendor approval. No payment is taken here.
      </p>
    </form>
  );
}
