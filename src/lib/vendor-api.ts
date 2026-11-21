import {
  SERVICE_CATEGORIES,
  type ServiceCategory,
} from "./services-api.ts";
import type {
  VendorApprovalStatus,
  VendorBooking,
  VendorOverview,
  VendorService,
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
    method: "GET" | "POST" | "PATCH";
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
