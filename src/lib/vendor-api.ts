import {
  SERVICE_CATEGORIES,
  type ServiceCategory,
} from "./services-api.ts";
import type {
  BookingPerson,
  PaginationMeta,
  VendorApprovalStatus,
  VendorBooking,
  VendorBookingView,
  VendorOverview,
  VendorService,
  VendorSubscriptionSummary,
} from "./vendor-dashboard.ts";

export const VENDOR_API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export const FREE_PLAN_LIMIT_SERVER_MESSAGE =
  "Free plan supports at most 3 active services. Upgrade to Premium or deactivate a service to continue.";

export type VendorApiErrorCode =
  | "UNAUTHORIZED"
  | "VENDOR_ACCESS_REQUIRED"
  | "ACCOUNT_BLOCKED"
  | "FORBIDDEN"
  | "FREE_PLAN_LIMIT_REACHED"
  | "IMAGE_UPLOAD_UNAVAILABLE"
  | "IMAGE_UPLOAD_FAILED"
  | "VALIDATION_ERROR"
  | "SERVICE_NOT_FOUND"
  | "INTERNAL_ERROR"
  | "NETWORK"
  | "INVALID_RESPONSE"
  | "UNEXPECTED_RESPONSE"
  | "UNKNOWN";

export class VendorApiError extends Error {
  readonly status: number;
  readonly code: VendorApiErrorCode;
  readonly details: unknown;

  constructor(
    message: string,
    status: number,
    code: VendorApiErrorCode,
    details?: unknown
  ) {
    super(message);
    this.name = "VendorApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export type ServiceFormValues = {
  title: string;
  category: string;
  description: string;
  location: string;
  price: string;
  images: string;
  isActive: boolean;
};

export type ServiceFormField =
  | "title"
  | "category"
  | "description"
  | "location"
  | "price"
  | "images";

export type ServiceFormErrors = Partial<Record<ServiceFormField, string>>;

export type CreateVendorServiceInput = {
  title: string;
  category: ServiceCategory;
  description: string;
  location: string;
  price: number;
  images: string[];
  isActive: boolean;
};

export type UpdateVendorServiceInput = Omit<
  CreateVendorServiceInput,
  "isActive"
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readErrorBody(body: unknown): {
  message?: string;
  code?: unknown;
  details?: unknown;
} {
  if (!isRecord(body)) return {};

  const error = body.error;
  if (!isRecord(error)) return {};

  return {
    message: typeof error.message === "string" ? error.message : undefined,
    code: error.code,
    details: error.details,
  };
}

export function normalizeVendorApiCode(
  code: unknown,
  status: number
): VendorApiErrorCode {
  if (code === "UNAUTHORIZED") return "UNAUTHORIZED";
  if (code === "VENDOR_ACCESS_REQUIRED") return "VENDOR_ACCESS_REQUIRED";
  if (code === "ACCOUNT_BLOCKED") return "ACCOUNT_BLOCKED";
  if (code === "FREE_PLAN_LIMIT_REACHED") return "FREE_PLAN_LIMIT_REACHED";
  if (code === "IMAGE_UPLOAD_UNAVAILABLE") return "IMAGE_UPLOAD_UNAVAILABLE";
  if (code === "IMAGE_UPLOAD_FAILED") return "IMAGE_UPLOAD_FAILED";
  if (code === "VALIDATION_ERROR") return "VALIDATION_ERROR";
  if (code === "SERVICE_NOT_FOUND") return "SERVICE_NOT_FOUND";
  if (code === "NOT_FOUND") return "UNKNOWN";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "SERVICE_NOT_FOUND";
  if (status >= 500) return "INTERNAL_ERROR";
  return "UNKNOWN";
}

function formatValidationDetails(details: unknown): string | null {
  if (!Array.isArray(details)) return null;

  const fields = details
    .map((detail) => {
      if (!isRecord(detail)) return null;
      const field = typeof detail.field === "string" ? detail.field : "request";
      const message =
        typeof detail.message === "string" ? detail.message : "is invalid";
      return `${field} ${message}`;
    })
    .filter((value): value is string => value !== null);

  return fields.length > 0 ? `Check the following: ${fields.join(", ")}.` : null;
}

export function createVendorApiError(
  body: unknown,
  status: number,
  fallbackMessage: string
): VendorApiError {
  const details = readErrorBody(body);
  const code = normalizeVendorApiCode(details.code, status);

  return new VendorApiError(
    messageForVendorApiError(
      new VendorApiError(
        details.message || fallbackMessage,
        status,
        code,
        details.details
      )
    ),
    status,
    code,
    details.details
  );
}

export function messageForVendorApiError(error: VendorApiError): string {
  switch (error.code) {
    case "UNAUTHORIZED":
      return "Your session has expired. Please sign in again to continue.";
    case "VENDOR_ACCESS_REQUIRED":
      return "Only vendor accounts can manage vendor services.";
    case "ACCOUNT_BLOCKED":
      return "Your account is blocked and cannot manage services. Please contact support.";
    case "FORBIDDEN":
      return "You don't have permission to perform this action.";
    case "FREE_PLAN_LIMIT_REACHED":
      return "Free plan supports at most 3 active services. Deactivate a service or upgrade to Premium before activating another.";
    case "IMAGE_UPLOAD_UNAVAILABLE":
      return "Image uploads are not configured on the server yet. You can add hosted image URLs manually.";
    case "IMAGE_UPLOAD_FAILED":
      return "The images could not be uploaded. Check the files and try again, or add hosted image URLs manually.";
    case "VALIDATION_ERROR":
      return (
        formatValidationDetails(error.details) ||
        error.message ||
        "Please check the service details and try again."
      );
    case "SERVICE_NOT_FOUND":
      return "This service was not found or is no longer available in your account.";
    case "INTERNAL_ERROR":
      return "The server couldn't complete this request. Please try again.";
    case "NETWORK":
      return "We couldn't reach the server. Check your connection and try again.";
    case "INVALID_RESPONSE":
      return "The server returned an invalid response. Please try again.";
    case "UNEXPECTED_RESPONSE":
      return "The server returned an unexpected response. Please try again.";
    default:
      return error.message || "Unable to complete this request right now.";
  }
}

function parseVendorService(value: unknown): VendorService {
  if (!isRecord(value)) {
    throw new VendorApiError(
      "The server returned an unexpected service record.",
      0,
      "UNEXPECTED_RESPONSE"
    );
  }

  const validApproval =
    value.approvalStatus === "pending" ||
    value.approvalStatus === "approved" ||
    value.approvalStatus === "rejected";

  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.category !== "string" ||
    !SERVICE_CATEGORIES.includes(value.category as ServiceCategory) ||
    typeof value.description !== "string" ||
    typeof value.location !== "string" ||
    !isFiniteNumber(value.price) ||
    !Array.isArray(value.images) ||
    !value.images.every((image) => typeof image === "string") ||
    !validApproval ||
    typeof value.isActive !== "boolean" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    throw new VendorApiError(
      "The server returned an unexpected service record.",
      0,
      "UNEXPECTED_RESPONSE"
    );
  }

  return {
    id: value.id,
    title: value.title,
    category: value.category,
    description: value.description,
    location: value.location,
    price: value.price,
    images: value.images as string[],
    approvalStatus: value.approvalStatus as VendorApprovalStatus,
    ...(typeof value.rejectionReason === "string"
      ? { rejectionReason: value.rejectionReason }
      : {}),
    ...(typeof value.vendorName === "string" ? { vendorName: value.vendorName } : {}),
    isActive: value.isActive,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function parseVendorBooking(value: unknown): VendorBooking {
  if (!isRecord(value)) {
    throw new VendorApiError(
      "The server returned an unexpected booking record.",
      0,
      "UNEXPECTED_RESPONSE"
    );
  }

  if (
    typeof value.id !== "string" ||
    typeof value.serviceId !== "string" ||
    typeof value.eventDate !== "string" ||
    typeof value.status !== "string"
  ) {
    throw new VendorApiError(
      "The server returned an unexpected booking record.",
      0,
      "UNEXPECTED_RESPONSE"
    );
  }

  return {
    id: value.id,
    serviceId: value.serviceId,
    customerId: typeof value.customerId === "string" ? value.customerId : "",
    eventDate: value.eventDate,
    eventLocation:
      typeof value.eventLocation === "string" ? value.eventLocation : "",
    message: typeof value.message === "string" ? value.message : "",
    status: value.status,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
  };
}

function parseBookingPerson(value: unknown, fallbackId: string): BookingPerson {
  if (!isRecord(value)) {
    return { id: fallbackId, name: "Account unavailable" };
  }

  return {
    id: typeof value.id === "string" ? value.id : fallbackId,
    name: typeof value.name === "string" && value.name.trim() ? value.name : "Account unavailable",
    ...(typeof value.image === "string" ? { image: value.image } : {}),
    ...(typeof value.businessName === "string"
      ? { businessName: value.businessName }
      : {}),
  };
}

export function parseVendorBookingView(value: unknown): VendorBookingView {
  const base = parseVendorBooking(value);
  if (!isRecord(value)) return { ...base, serviceTitle: "", customer: { id: base.customerId, name: "" }, updatedAt: "" };

  return {
    ...base,
    serviceTitle:
      typeof value.serviceTitle === "string" ? value.serviceTitle : "Service unavailable",
    customer: parseBookingPerson(value.customer, base.customerId),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
  };
}

function parsePaginationMeta(value: unknown): PaginationMeta {
  const fallback: PaginationMeta = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  if (!isRecord(value)) return fallback;

  return {
    page: isFiniteNumber(value.page) ? value.page : fallback.page,
    limit: isFiniteNumber(value.limit) ? value.limit : fallback.limit,
    total: isFiniteNumber(value.total) ? value.total : fallback.total,
    totalPages: isFiniteNumber(value.totalPages) ? value.totalPages : fallback.totalPages,
    hasNextPage: value.hasNextPage === true,
    hasPreviousPage: value.hasPreviousPage === true,
  };
}

export function parsePaginatedResponse<T>(
  body: unknown,
  parser: (value: unknown) => T,
  message: string
): { items: T[]; meta: PaginationMeta } {
  if (
    !isRecord(body) ||
    body.success !== true ||
    !Array.isArray(body.data) ||
    !isRecord(body.meta)
  ) {
    throw new VendorApiError(message, 0, "UNEXPECTED_RESPONSE");
  }

  return {
    items: body.data.map(parser),
    meta: parsePaginationMeta(body.meta),
  };
}

export function parseVendorSubscriptionResponse(
  body: unknown
): VendorSubscriptionSummary {
  if (!isRecord(body) || body.success !== true || !isRecord(body.data)) {
    throw new VendorApiError(
      "The server returned an unexpected subscription response.",
      0,
      "UNEXPECTED_RESPONSE"
    );
  }

  const data = body.data;
  const statuses = ["active", "expired", "pending", "failed", "cancelled", "none"];
  if (
    (data.plan !== "free" && data.plan !== "premium") ||
    (typeof data.status !== "string" || !statuses.includes(data.status)) ||
    !isFiniteNumber(data.activeServices)
  ) {
    throw new VendorApiError(
      "The server returned an unexpected subscription response.",
      0,
      "UNEXPECTED_RESPONSE"
    );
  }

  const price = isRecord(data.price)
    ? {
        amount: isFiniteNumber(data.price.amount) ? data.price.amount : 0,
        currency: text(data.price.currency, "usd"),
        interval: text(data.price.interval, "month"),
      }
    : null;

  const recentTransactions = Array.isArray(data.recentTransactions)
    ? data.recentTransactions.flatMap((entry) => {
        if (!isRecord(entry) || typeof entry.id !== "string") return [];
        return [
          {
            id: entry.id,
            status: text(entry.status, "pending"),
            amount: isFiniteNumber(entry.amount) ? entry.amount : 0,
            currency: text(entry.currency, "usd"),
            createdAt: text(entry.createdAt),
            ...(typeof entry.stripeSessionId === "string"
              ? { stripeSessionId: entry.stripeSessionId }
              : {}),
          },
        ];
      })
    : [];

  return {
    plan: data.plan,
    storedPlan:
      data.storedPlan === "free" || data.storedPlan === "premium"
        ? data.storedPlan
        : "unknown",
    status: data.status as VendorSubscriptionSummary["status"],
    startedAt: typeof data.startedAt === "string" ? data.startedAt : null,
    expiresAt: typeof data.expiresAt === "string" ? data.expiresAt : null,
    activeServices: data.activeServices,
    activeServiceLimit: isFiniteNumber(data.activeServiceLimit)
      ? data.activeServiceLimit
      : null,
    checkoutAvailable: data.checkoutAvailable === true,
    price,
    recentTransactions,
  };
}

export function parseVendorDashboardResponse(body: unknown): VendorOverview {
  if (!isRecord(body) || body.success !== true || !isRecord(body.data)) {
    throw new VendorApiError(
      "The server returned an unexpected dashboard response.",
      0,
      "UNEXPECTED_RESPONSE"
    );
  }

  const { stats, services, bookings } = body.data;

  if (
    !isRecord(stats) ||
    !isFiniteNumber(stats.totalServices) ||
    !isFiniteNumber(stats.activeServices) ||
    !isFiniteNumber(stats.pendingApproval) ||
    !isFiniteNumber(stats.totalBookings) ||
    !Array.isArray(services) ||
    !Array.isArray(bookings)
  ) {
    throw new VendorApiError(
      "The server returned an unexpected dashboard response.",
      0,
      "UNEXPECTED_RESPONSE"
    );
  }

  return {
    stats: {
      totalServices: stats.totalServices,
      activeServices: stats.activeServices,
      pendingApproval: stats.pendingApproval,
      totalBookings: stats.totalBookings,
      pendingBookingRequests: isFiniteNumber(stats.pendingBookingRequests)
        ? stats.pendingBookingRequests
        : null,
      acceptedBookings: isFiniteNumber(stats.acceptedBookings)
        ? stats.acceptedBookings
        : null,
      currentSubscriptionPlan:
        stats.currentSubscriptionPlan === "premium" ||
        stats.currentSubscriptionPlan === "free"
          ? stats.currentSubscriptionPlan
          : null,
      activeServiceLimit: isFiniteNumber(stats.activeServiceLimit)
        ? stats.activeServiceLimit
        : null,
    },
    services: services.map(parseVendorService),
    bookings: bookings.map(parseVendorBooking),
  };
}

export function parseVendorServicesResponse(body: unknown): VendorService[] {
  if (!isRecord(body) || body.success !== true || !Array.isArray(body.data)) {
    throw new VendorApiError(
      "The server returned an unexpected services response.",
      0,
      "UNEXPECTED_RESPONSE"
    );
  }

  return body.data.map(parseVendorService);
}

export function parseVendorServiceResponse(body: unknown): VendorService {
  if (!isRecord(body) || body.success !== true) {
    throw new VendorApiError(
      "The server returned an unexpected service response.",
      0,
      "UNEXPECTED_RESPONSE"
    );
  }

  return parseVendorService(body.data);
}

export function validateServiceForm(
  values: ServiceFormValues
): ServiceFormErrors {
  const errors: ServiceFormErrors = {};
  const title = values.title.trim();
  const description = values.description.trim();
  const location = values.location.trim();
  const price = Number(values.price);
  const images = parseImageUrls(values.images);

  if (!title) errors.title = "Enter a service title.";
  else if (title.length > 120) errors.title = "Use 120 characters or fewer.";

  if (!SERVICE_CATEGORIES.includes(values.category as ServiceCategory)) {
    errors.category = "Choose a valid category.";
  }

  if (!description) errors.description = "Enter a description.";
  else if (description.length > 5000) {
    errors.description = "Use 5000 characters or fewer.";
  }

  if (!location) errors.location = "Enter a location.";
  else if (location.length > 150) errors.location = "Use 150 characters or fewer.";

  if (!values.price.trim() || !Number.isFinite(price)) {
    errors.price = "Enter a valid price.";
  } else if (price < 0 || price > 1_000_000) {
    errors.price = "Price must be between 0 and 1,000,000.";
  }

  if (images.length > 10) errors.images = "Add up to 10 image URLs.";
  else if (images.some((image) => image.length > 2048)) {
    errors.images = "Each image URL must be 2048 characters or fewer.";
  }

  return errors;
}

export function parseImageUrls(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export const SERVICE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
export const MAX_SERVICE_IMAGES = 10;
export const MAX_SERVICE_IMAGE_BYTES = 5 * 1024 * 1024;

export type ServiceImageUpload = { name: string; data: string };

export async function toImageUploadPayload(
  files: File[]
): Promise<ServiceImageUpload[]> {
  if (files.length === 0) {
    throw new VendorApiError(
      "Choose at least one image to upload.",
      0,
      "VALIDATION_ERROR"
    );
  }

  if (files.length > MAX_SERVICE_IMAGES) {
    throw new VendorApiError(
      `Upload at most ${MAX_SERVICE_IMAGES} images at a time.`,
      0,
      "VALIDATION_ERROR"
    );
  }

  const payload: ServiceImageUpload[] = [];

  for (const file of files) {
    if (
      !SERVICE_IMAGE_TYPES.includes(file.type as (typeof SERVICE_IMAGE_TYPES)[number])
    ) {
      throw new VendorApiError(
        `${file.name} is not a supported image type.`,
        0,
        "VALIDATION_ERROR"
      );
    }

    if (file.size === 0 || file.size > MAX_SERVICE_IMAGE_BYTES) {
      throw new VendorApiError(
        `${file.name} must be between 1 byte and 5 MB.`,
        0,
        "VALIDATION_ERROR"
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(
        ...bytes.subarray(index, index + chunkSize)
      );
    }

    payload.push({ name: file.name, data: btoa(binary) });
  }

  return payload;
}

export function parseUploadedImagesResponse(body: unknown): string[] {
  if (
    !isRecord(body) ||
    body.success !== true ||
    !isRecord(body.data) ||
    !Array.isArray(body.data.images)
  ) {
    throw new VendorApiError(
      "The server returned an unexpected image upload response.",
      0,
      "UNEXPECTED_RESPONSE"
    );
  }

  const urls = body.data.images
    .map((image: unknown) =>
      isRecord(image) && typeof image.url === "string" ? image.url.trim() : ""
    )
    .filter(Boolean);

  if (urls.length === 0) {
    throw new VendorApiError(
      "The image host did not return any usable URLs.",
      0,
      "UNEXPECTED_RESPONSE"
    );
  }

  return urls;
}

export async function uploadServiceImages(
  files: File[],
  signal?: AbortSignal
): Promise<string[]> {
  const images = await toImageUploadPayload(files);

  return (await requestVendorApi(
    "/api/vendor/services/images",
    {
      method: "POST",
      body: { images },
      signal,
      fallbackMessage: "Unable to upload these images right now.",
    },
    parseUploadedImagesResponse
  )) as string[];
}

export function toCreateServiceInput(
  values: ServiceFormValues
): CreateVendorServiceInput {
  return {
    title: values.title.trim(),
    category: values.category as ServiceCategory,
    description: values.description.trim(),
    location: values.location.trim(),
    price: Number(values.price),
    images: parseImageUrls(values.images),
    isActive: values.isActive,
  };
}

export function toUpdateServiceInput(
  values: ServiceFormValues
): UpdateVendorServiceInput {
  return {
    title: values.title.trim(),
    category: values.category as ServiceCategory,
    description: values.description.trim(),
    location: values.location.trim(),
    price: Number(values.price),
    images: parseImageUrls(values.images),
  };
}

async function requestVendorApi(
  path: string,
  options: {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
    signal?: AbortSignal;
    fallbackMessage: string;
  },
  parser: (body: unknown) => unknown
): Promise<unknown> {
  let response: Response;

  try {
    const headers: Record<string, string> = { Accept: "application/json" };

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    response = await fetch(`${VENDOR_API_BASE_URL}${path}`, {
      method: options.method,
      credentials: "include",
      cache: "no-store",
      signal: options.signal,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new VendorApiError(
      "We couldn't reach the server. Check your connection and try again.",
      0,
      "NETWORK"
    );
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new VendorApiError(
      "The server returned an invalid response.",
      response.status,
      "INVALID_RESPONSE"
    );
  }

  if (!response.ok) {
    throw createVendorApiError(body, response.status, options.fallbackMessage);
  }

  return parser(body) as never;
}

export async function getVendorDashboard(
  signal?: AbortSignal
): Promise<VendorOverview> {
  return (await requestVendorApi(
    "/api/vendor/dashboard",
    {
      method: "GET",
      signal,
      fallbackMessage: "Unable to load your dashboard right now.",
    },
    parseVendorDashboardResponse
  )) as VendorOverview;
}

export async function getVendorServices(
  signal?: AbortSignal
): Promise<VendorService[]> {
  return (await requestVendorApi(
    "/api/vendor/services",
    {
      method: "GET",
      signal,
      fallbackMessage: "Unable to load your services right now.",
    },
    parseVendorServicesResponse
  )) as VendorService[];
}

export async function createVendorService(
  input: CreateVendorServiceInput
): Promise<VendorService> {
  return (await requestVendorApi(
    "/api/vendor/services",
    {
      method: "POST",
      body: input,
      fallbackMessage: "Unable to create this service right now.",
    },
    parseVendorServiceResponse
  )) as VendorService;
}

export async function updateVendorService(
  id: string,
  input: UpdateVendorServiceInput
): Promise<VendorService> {
  return (await requestVendorApi(
    `/api/vendor/services/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: input,
      fallbackMessage: "Unable to update this service right now.",
    },
    parseVendorServiceResponse
  )) as VendorService;
}

export async function setVendorServiceActive(
  id: string,
  isActive: boolean
): Promise<VendorService> {
  return (await requestVendorApi(
    `/api/vendor/services/${encodeURIComponent(id)}/active`,
    {
      method: "PATCH",
      body: { isActive },
      fallbackMessage: "Unable to change this service's status right now.",
    },
    parseVendorServiceResponse
  )) as VendorService;
}

export type VendorServiceQuery = {
  q?: string;
  category?: string;
  approvalStatus?: VendorApprovalStatus;
  isActive?: "all" | "true" | "false";
  page?: number;
  limit?: number;
};

export type VendorBookingQuery = {
  status?: string;
  serviceId?: string;
  page?: number;
  limit?: number;
};

function toQueryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getVendorServicesPage(
  query: VendorServiceQuery = {},
  signal?: AbortSignal
) {
  return (await requestVendorApi(
    `/api/vendor/services${toQueryString(query)}`,
    {
      method: "GET",
      signal,
      fallbackMessage: "Unable to load your services right now.",
    },
    (body) => parsePaginatedResponse(body, parseVendorService, "Unable to load your services right now.")
  )) as { items: VendorService[]; meta: PaginationMeta };
}

export async function getVendorService(
  id: string,
  signal?: AbortSignal
): Promise<VendorService> {
  return (await requestVendorApi(
    `/api/vendor/services/${encodeURIComponent(id)}`,
    {
      method: "GET",
      signal,
      fallbackMessage: "Unable to load this service right now.",
    },
    parseVendorServiceResponse
  )) as VendorService;
}

export async function deleteVendorService(id: string): Promise<void> {
  await requestVendorApi(
    `/api/vendor/services/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      fallbackMessage: "Unable to delete this service right now.",
    },
    () => null
  );
}

export async function getVendorBookings(
  query: VendorBookingQuery = {},
  signal?: AbortSignal
) {
  return (await requestVendorApi(
    `/api/vendor/bookings${toQueryString(query)}`,
    {
      method: "GET",
      signal,
      fallbackMessage: "Unable to load booking requests right now.",
    },
    (body) => parsePaginatedResponse(body, parseVendorBookingView, "Unable to load booking requests right now.")
  )) as { items: VendorBookingView[]; meta: PaginationMeta };
}

export async function getVendorBooking(
  id: string,
  signal?: AbortSignal
): Promise<VendorBookingView> {
  return (await requestVendorApi(
    `/api/vendor/bookings/${encodeURIComponent(id)}`,
    {
      method: "GET",
      signal,
      fallbackMessage: "Unable to load this booking right now.",
    },
    (body) => {
      if (!isRecord(body) || body.success !== true) {
        throw new VendorApiError(
          "The server returned an unexpected booking response.",
          0,
          "UNEXPECTED_RESPONSE"
        );
      }
      return parseVendorBookingView(body.data);
    }
  )) as VendorBookingView;
}

export async function processVendorBooking(
  id: string,
  action: "accept" | "reject"
): Promise<VendorBookingView> {
  return (await requestVendorApi(
    `/api/vendor/bookings/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: { action },
      fallbackMessage: "Unable to update this booking right now.",
    },
    (body) => {
      if (!isRecord(body) || body.success !== true) {
        throw new VendorApiError(
          "The server returned an unexpected booking response.",
          0,
          "UNEXPECTED_RESPONSE"
        );
      }
      return parseVendorBookingView(body.data);
    }
  )) as VendorBookingView;
}

export async function getVendorSubscription(
  signal?: AbortSignal
): Promise<VendorSubscriptionSummary> {
  return (await requestVendorApi(
    "/api/vendor/subscription",
    {
      method: "GET",
      signal,
      fallbackMessage: "Unable to load your subscription right now.",
    },
    parseVendorSubscriptionResponse
  )) as VendorSubscriptionSummary;
}
