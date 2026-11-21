export interface BookingFormValues {
  eventDate: string;
  eventLocation: string;
  message: string;
}

export type BookingFormErrors = Partial<Record<keyof BookingFormValues, string>>;

export function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function futureDateString(now = Date.now()): string {
  return new Date(now + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function parseDateOnly(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function validateBookingForm(
  values: BookingFormValues,
  now = Date.now()
): BookingFormErrors {
  const errors: BookingFormErrors = {};

  if (!values.eventDate) {
    errors.eventDate = "Choose your event date.";
  } else {
    const date = parseDateOnly(values.eventDate);
    if (!date) {
      errors.eventDate = "Enter a valid event date.";
    } else if (date.getTime() <= now) {
      errors.eventDate = "Choose a date in the future.";
    }
  }

  const location = values.eventLocation.trim();
  if (!location) {
    errors.eventLocation = "Enter your event location.";
  } else if (location.length > 150) {
    errors.eventLocation = "Keep the location under 150 characters.";
  }

  if (values.message.trim().length > 1000) {
    errors.message = "Keep your message under 1000 characters.";
  }

  return errors;
}
