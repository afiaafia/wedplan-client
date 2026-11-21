export interface BookingRequestInput {
  serviceId: string;
  eventDate: string;
  eventLocation: string;
  message: string;
}

export interface BookingConfirmation {
  id: string;
  serviceId: string;
  serviceTitle: string;
  vendorId: string;
  eventDate: string;
  eventLocation: string;
  message: string;
  status: "Pending" | "Accepted" | "Rejected" | "Cancelled";
  createdAt: string;
}

export interface BookingErrorDetail {
  field: string;
  message: string;
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const BOOKING_ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Please sign in again to submit your request.",
  CUSTOMER_ACCESS_REQUIRED: "Only customers can submit booking requests.",
  ACCOUNT_BLOCKED: "Your account has been blocked.",
  SERVICE_NOT_FOUND: "This service is no longer available for booking.",
  CANNOT_BOOK_OWN_SERVICE: "You cannot book your own service.",
  DUPLICATE_BOOKING:
    "You already have an active request for this service on that date.",
  VALIDATION_ERROR: "Please check your booking details and try again.",
  INVALID_JSON: "Please check your booking details and try again.",
  INTERNAL_ERROR: "We couldn't submit your request right now. Please try again.",
};

export class BookingApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: BookingErrorDetail[];

  constructor(
    message: string,
    status: number,
    code = "UNKNOWN",
    details: BookingErrorDetail[] = []
  ) {
    super(message);
    this.name = "BookingApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function formatBookingDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function messageForBookingError(error: unknown): string {
  if (error instanceof BookingApiError) {
    return error.message;
  }

  return "We couldn't submit your request right now. Please try again.";
}

async function parseResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new BookingApiError(
      "The server returned an invalid response.",
      response.status,
      "INVALID_RESPONSE"
    );
  }
}

export async function createBookingRequest(
  input: BookingRequestInput,
  signal?: AbortSignal
): Promise<BookingConfirmation> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(input),
      signal,
      cache: "no-store",
    });
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    throw new BookingApiError(
      "We couldn't reach the server. Please check your connection and try again.",
      0,
      "NETWORK_ERROR"
    );
  }

  const body = (await parseResponse(response)) as {
    success?: boolean;
    data?: BookingConfirmation;
    error?: {
      message?: string;
      code?: string;
      details?: BookingErrorDetail[];
    };
  };

  if (!response.ok || body.success !== true) {
    const code = body.error?.code ?? "UNKNOWN";
    const details = Array.isArray(body.error?.details)
      ? body.error.details
      : [];

    throw new BookingApiError(
      code === "VALIDATION_ERROR"
        ? (details[0]?.message ?? BOOKING_ERROR_MESSAGES[code] ?? "Please check your booking details.")
        : (body.error?.message ?? BOOKING_ERROR_MESSAGES[code] ?? "We couldn't submit your request."),
      response.status,
      code,
      details
    );
  }

  if (!body.data) {
    throw new BookingApiError(
      "The server returned an unexpected response.",
      response.status,
      "INVALID_RESPONSE"
    );
  }

  return body.data;
}
