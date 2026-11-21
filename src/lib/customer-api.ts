import { getServerApiBaseUrl } from "./api-url.ts";
import {
  CUSTOMER_BOOKING_STATUSES,
  type CustomerBooking,
  type CustomerBookingFilter,
  type CustomerBookingStatus,
  type CustomerDashboardData,
  type CustomerPagination,
  type CustomerProfile,
} from "./customer-dashboard.ts";

export const CUSTOMER_PROFILE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export const MAX_CUSTOMER_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

export interface CustomerErrorDetail {
  field: string;
  message: string;
}

type CustomerRequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  fetchImpl?: typeof fetch;
};

type CustomerParser<T> = (value: unknown, meta?: unknown) => T;

export class CustomerApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: CustomerErrorDetail[];

  constructor(
    message: string,
    status = 0,
    code = "UNKNOWN",
    details: CustomerErrorDetail[] = []
  ) {
    super(message);
    this.name = "CustomerApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown): string {
  if (typeof value !== "string") throw new Error("Expected a string");
  return value;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseStatus(value: unknown): CustomerBookingStatus {
  if (
    typeof value === "string" &&
    (CUSTOMER_BOOKING_STATUSES as readonly string[]).includes(value)
  ) {
    return value as CustomerBookingStatus;
  }

  throw new Error("Unsupported booking status");
}

function parseService(value: unknown): CustomerBooking["service"] {
  if (value === null) return null;
  if (!isRecord(value)) throw new Error("Invalid service relation");

  return {
    id: requiredString(value.id),
    title: requiredString(value.title),
    image: nullableString(value.image),
    category: nullableString(value.category),
    price: nullableNumber(value.price),
  };
}

function parseVendor(value: unknown): CustomerBooking["vendor"] {
  if (value === null) return null;
  if (!isRecord(value)) throw new Error("Invalid vendor relation");

  return {
    id: requiredString(value.id),
    name: nullableString(value.name),
    businessName: nullableString(value.businessName),
    profileImage: nullableString(value.profileImage),
  };
}

function parseBooking(value: unknown): CustomerBooking {
  if (!isRecord(value)) throw new Error("Invalid booking");

  return {
    id: requiredString(value.id),
    serviceId: requiredString(value.serviceId),
    service: parseService(value.service),
    vendorId: requiredString(value.vendorId),
    vendor: parseVendor(value.vendor),
    eventDate: requiredString(value.eventDate),
    eventLocation: requiredString(value.eventLocation),
    message: requiredString(value.message),
    status: parseStatus(value.status),
    createdAt: requiredString(value.createdAt),
    updatedAt: requiredString(value.updatedAt),
  };
}

function parseDashboard(value: unknown): CustomerDashboardData {
  if (!isRecord(value) || !isRecord(value.stats) || !Array.isArray(value.bookings)) {
    throw new Error("Invalid dashboard payload");
  }

  const stats = value.stats;
  return {
    stats: {
      totalBookings: Number(stats.totalBookings),
      pendingBookings: Number(stats.pendingBookings),
      acceptedBookings: Number(stats.acceptedBookings),
      rejectedBookings: Number(stats.rejectedBookings),
    },
    bookings: value.bookings.map(parseBooking),
  };
}

function parsePagination(value: unknown): CustomerPagination {
  if (!isRecord(value)) throw new Error("Invalid pagination payload");

  return {
    page: Number(value.page),
    limit: Number(value.limit),
    total: Number(value.total),
    totalPages: Number(value.totalPages),
    hasNextPage: value.hasNextPage === true,
    hasPreviousPage: value.hasPreviousPage === true,
  };
}

function parseBookingsPage(
  value: unknown,
  meta?: unknown
): {
  bookings: CustomerBooking[];
  pagination: CustomerPagination;
} {
  if (!Array.isArray(value)) throw new Error("Invalid booking list payload");

  return { bookings: value.map(parseBooking), pagination: parsePagination(meta) };
}

function parseProfile(value: unknown): CustomerProfile {
  if (!isRecord(value)) throw new Error("Invalid profile payload");

  return {
    id: requiredString(value.id),
    name: requiredString(value.name),
    email: requiredString(value.email),
    image: nullableString(value.image),
    businessName: nullableString(value.businessName),
    createdAt: requiredString(value.createdAt),
    updatedAt: requiredString(value.updatedAt),
  };
}

function parseEnvelope<T>(
  body: unknown,
  parser: CustomerParser<T>,
  responseStatus: number
): T {
  if (!isRecord(body) || typeof body.success !== "boolean") {
    throw new CustomerApiError(
      "The server returned an invalid response.",
      responseStatus,
      "INVALID_RESPONSE"
    );
  }

  if (!body.success) {
    const error = isRecord(body.error) ? body.error : {};
    const details = Array.isArray(error.details)
      ? error.details.filter(
          (detail): detail is CustomerErrorDetail =>
            isRecord(detail) &&
            typeof detail.field === "string" &&
            typeof detail.message === "string"
        )
      : [];

    throw new CustomerApiError(
      typeof error.message === "string" && error.message
        ? error.message
        : "We couldn't complete your request.",
      responseStatus,
      typeof error.code === "string" ? error.code : "UNKNOWN",
      details
    );
  }

  try {
    return parser(body.data, body.meta);
  } catch {
    throw new CustomerApiError(
      "The server returned an unexpected response.",
      responseStatus,
      "UNEXPECTED_RESPONSE"
    );
  }
}

async function requestCustomerApi<T>(
  path: string,
  options: CustomerRequestOptions | undefined,
  parser: CustomerParser<T>
): Promise<T> {
  const method = options?.method ?? "GET";
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options?.headers,
  };

  if (options?.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;

  try {
    response = await (options?.fetchImpl ?? fetch)(
      `${getServerApiBaseUrl()}${path}`,
      {
        method,
        credentials: "include",
        headers,
        body: options?.body === undefined ? undefined : JSON.stringify(options.body),
        signal: options?.signal,
        cache: "no-store",
      }
    );
  } catch (error) {
    if (options?.signal?.aborted) throw error;

    throw new CustomerApiError(
      "We couldn't reach the server. Check your connection and try again.",
      0,
      "NETWORK_ERROR"
    );
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new CustomerApiError(
      "The server returned an invalid response.",
      response.status,
      "INVALID_RESPONSE"
    );
  }

  return parseEnvelope(body, parser, response.status);
}

export function getCustomerDashboard(
  options?: CustomerRequestOptions
): Promise<CustomerDashboardData> {
  return requestCustomerApi("/api/customer/dashboard?limit=5", options, parseDashboard);
}

export function getCustomerBookings(
  query: { page?: number; status?: CustomerBookingFilter } = {},
  options?: CustomerRequestOptions
): Promise<{ bookings: CustomerBooking[]; pagination: CustomerPagination }> {
  const searchParams = new URLSearchParams();
  if (query.page !== undefined) searchParams.set("page", String(query.page));
  if (query.status && query.status !== "all") searchParams.set("status", query.status);

  const suffix = searchParams.size ? `?${searchParams.toString()}` : "";
  return requestCustomerApi(
    `/api/customer/bookings${suffix}`,
    options,
    parseBookingsPage
  );
}

export function getCustomerBooking(
  bookingId: string,
  options?: CustomerRequestOptions
): Promise<CustomerBooking> {
  return requestCustomerApi(
    `/api/customer/bookings/${encodeURIComponent(bookingId)}`,
    options,
    parseBooking
  );
}

export function cancelCustomerBooking(
  bookingId: string,
  options?: CustomerRequestOptions
): Promise<CustomerBooking> {
  return requestCustomerApi(
    `/api/customer/bookings/${encodeURIComponent(bookingId)}/cancel`,
    { ...options, method: "POST" },
    parseBooking
  );
}

export function getCustomerProfile(
  options?: CustomerRequestOptions
): Promise<CustomerProfile> {
  return requestCustomerApi("/api/customer/profile", options, parseProfile);
}

export function updateCustomerProfile(
  name: string,
  options?: CustomerRequestOptions
): Promise<CustomerProfile> {
  return requestCustomerApi(
    "/api/customer/profile",
    { ...options, method: "PATCH", body: { name } },
    parseProfile
  );
}

export function fileToBase64(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress?.(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      }
    };

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new CustomerApiError("We couldn't read that image.", 0, "INVALID_FILE"));
        return;
      }

      const comma = reader.result.indexOf(",");
      onProgress?.(100);
      resolve(comma === -1 ? reader.result : reader.result.slice(comma + 1));
    };

    reader.onerror = () => {
      reject(new CustomerApiError("We couldn't read that image.", 0, "INVALID_FILE"));
    };

    reader.readAsDataURL(file);
  });
}

export function validateProfileImage(file: File): string | null {
  if (!(CUSTOMER_PROFILE_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Choose a JPEG, PNG, GIF, or WebP image.";
  }

  if (file.size > MAX_CUSTOMER_PROFILE_IMAGE_BYTES) {
    return "Choose an image smaller than 5 MB.";
  }

  return null;
}

export async function uploadCustomerProfileImage(
  file: File,
  onProgress?: (progress: number) => void,
  options?: CustomerRequestOptions
): Promise<CustomerProfile> {
  const validationError = validateProfileImage(file);
  if (validationError) {
    throw new CustomerApiError(validationError, 0, "VALIDATION_ERROR");
  }

  const data = await fileToBase64(file, onProgress);

  return requestCustomerApi(
    "/api/customer/profile/image",
    {
      ...options,
      method: "POST",
      body: {
        image: {
          name: file.name || "profile-image",
          data,
        },
      },
    },
    parseProfile
  );
}

export function messageForCustomerApiError(
  error: unknown,
  fallback = "We couldn't complete your request. Please try again."
): string {
  if (error instanceof CustomerApiError) return error.message;
  return fallback;
}
