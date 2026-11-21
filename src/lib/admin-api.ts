import { VENDOR_API_BASE_URL } from "./vendor-api.ts";
import type {
  BookingPerson,
  PaginationMeta,
  VendorService,
} from "./vendor-dashboard.ts";
import { SERVICE_CATEGORIES, type ServiceCategory } from "./services-api.ts";

export type AdminDashboardData = {
  stats: {
    totalUsers: number;
    totalCustomers: number;
    totalVendors: number;
    totalServices: number;
    pendingServiceApprovals: number;
    totalBookings: number;
    totalTransactions: number;
    premiumVendors: number;
  };
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    image?: string;
    role: "customer" | "vendor" | "admin";
    createdAt: string;
  }>;
  recentServices: Array<{
    id: string;
    title: string;
    category: string;
    approvalStatus: string;
    createdAt: string;
    vendorName?: string;
    image?: string;
  }>;
  recentBookings: Array<{
    id: string;
    serviceId: string;
    status: string;
    createdAt: string;
    eventDate: string;
  }>;
  recentTransactions: Array<{
    id: string;
    plan: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    vendorName?: string;
  }>;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  image?: string;
  businessName?: string;
  role: "customer" | "vendor" | "admin";
  isBlocked: boolean;
  subscriptionPlan: "free" | "premium";
  createdAt: string;
};

export type AdminBooking = {
  id: string;
  serviceId: string;
  customerId: string;
  vendorId: string;
  eventDate: string;
  eventLocation: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  serviceTitle: string;
  customer: BookingPerson;
  vendor: BookingPerson;
};

export type AdminTransaction = {
  id: string;
  vendorId: string;
  vendorName?: string;
  vendorEmail?: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  stripeSessionId?: string;
};

export class AdminApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status = 0, code = "UNEXPECTED_RESPONSE") {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function parsePerson(value: unknown, fallbackId: string): BookingPerson {
  if (!isRecord(value)) return { id: fallbackId, name: "Account unavailable" };
  return {
    id: text(value.id, fallbackId),
    name: text(value.name, "Account unavailable"),
    ...(typeof value.image === "string" ? { image: value.image } : {}),
    ...(typeof value.businessName === "string"
      ? { businessName: value.businessName }
      : {}),
  };
}

function parseMeta(value: unknown): PaginationMeta {
  if (!isRecord(value)) {
    return {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  return {
    page: isFiniteNumber(value.page) ? value.page : 1,
    limit: isFiniteNumber(value.limit) ? value.limit : 10,
    total: isFiniteNumber(value.total) ? value.total : 0,
    totalPages: isFiniteNumber(value.totalPages) ? value.totalPages : 0,
    hasNextPage: value.hasNextPage === true,
    hasPreviousPage: value.hasPreviousPage === true,
  };
}

function parseAdminService(value: unknown): VendorService {
  if (!isRecord(value)) throw new AdminApiError("Unexpected service record.");
  const approval = value.approvalStatus;
  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.category !== "string" ||
    !SERVICE_CATEGORIES.includes(value.category as ServiceCategory) ||
    typeof value.description !== "string" ||
    typeof value.location !== "string" ||
    !isFiniteNumber(value.price) ||
    !Array.isArray(value.images) ||
    (approval !== "pending" && approval !== "approved" && approval !== "rejected") ||
    typeof value.isActive !== "boolean" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    throw new AdminApiError("Unexpected service record.");
  }

  return {
    id: value.id,
    title: value.title,
    category: value.category,
    description: value.description,
    location: value.location,
    price: value.price,
    images: value.images.filter((image): image is string => typeof image === "string"),
    approvalStatus: approval,
    ...(typeof value.rejectionReason === "string"
      ? { rejectionReason: value.rejectionReason }
      : {}),
    ...(typeof value.vendorName === "string" ? { vendorName: value.vendorName } : {}),
    isActive: value.isActive,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function parseAdminUser(value: unknown): AdminUser {
  if (!isRecord(value) || typeof value.id !== "string") {
    throw new AdminApiError("Unexpected user record.");
  }
  const role = value.role;
  return {
    id: value.id,
    name: text(value.name, "Unknown user"),
    email: text(value.email),
    ...(typeof value.image === "string" ? { image: value.image } : {}),
    ...(typeof value.businessName === "string"
      ? { businessName: value.businessName }
      : {}),
    role: role === "vendor" || role === "admin" ? role : "customer",
    isBlocked: value.isBlocked === true,
    subscriptionPlan: value.subscriptionPlan === "premium" ? "premium" : "free",
    createdAt: text(value.createdAt),
  };
}

function parseAdminBooking(value: unknown): AdminBooking {
  if (!isRecord(value) || typeof value.id !== "string") {
    throw new AdminApiError("Unexpected booking record.");
  }
  return {
    id: value.id,
    serviceId: text(value.serviceId),
    customerId: text(value.customerId),
    vendorId: text(value.vendorId),
    eventDate: text(value.eventDate),
    eventLocation: text(value.eventLocation),
    message: text(value.message),
    status: text(value.status, "Pending"),
    createdAt: text(value.createdAt),
    updatedAt: text(value.updatedAt),
    serviceTitle: text(value.serviceTitle, "Service unavailable"),
    customer: parsePerson(value.customer, text(value.customerId)),
    vendor: parsePerson(value.vendor, text(value.vendorId)),
  };
}

function parseAdminTransaction(value: unknown): AdminTransaction {
  if (!isRecord(value) || typeof value.id !== "string") {
    throw new AdminApiError("Unexpected transaction record.");
  }
  return {
    id: value.id,
    vendorId: text(value.vendorId),
    plan: text(value.plan, "premium"),
    amount: isFiniteNumber(value.amount) ? value.amount : 0,
    currency: text(value.currency, "usd"),
    status: text(value.status, "pending"),
    createdAt: text(value.createdAt),
    ...(typeof value.stripeSessionId === "string"
      ? { stripeSessionId: value.stripeSessionId }
      : {}),
    ...(typeof value.vendorName === "string" ? { vendorName: value.vendorName } : {}),
    ...(typeof value.vendorEmail === "string" ? { vendorEmail: value.vendorEmail } : {}),
  };
}

async function request(
  path: string,
  options: {
    method?: "GET" | "PATCH" | "DELETE";
    body?: unknown;
    signal?: AbortSignal;
    fallbackMessage: string;
  }
): Promise<unknown> {
  let response: Response;
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (options.body !== undefined) headers["Content-Type"] = "application/json";

    response = await fetch(`${VENDOR_API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      credentials: "include",
      cache: "no-store",
      signal: options.signal,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new AdminApiError("Unable to reach the admin API.", 0, "NETWORK");
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = isRecord(body) && isRecord(body.error) ? body.error : {};
    throw new AdminApiError(
      typeof error.message === "string" ? error.message : options.fallbackMessage,
      response.status,
      typeof error.code === "string" ? error.code : "UNKNOWN"
    );
  }

  if (!isRecord(body) || body.success !== true) {
    throw new AdminApiError("The server returned an unexpected response.");
  }

  return body;
}

function parseSuccess<T>(
  body: unknown,
  parser: (value: unknown) => T,
  fallbackMessage: string
): T {
  if (!isRecord(body)) throw new AdminApiError(fallbackMessage);
  return parser(body.data);
}

function parsePage<T>(
  body: unknown,
  parser: (value: unknown) => T,
  fallbackMessage: string
): { items: T[]; meta: PaginationMeta } {
  if (!isRecord(body) || !Array.isArray(body.data) || !isRecord(body.meta)) {
    throw new AdminApiError(fallbackMessage);
  }
  return {
    items: body.data.map(parser),
    meta: parseMeta(body.meta),
  };
}

function queryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const value = search.toString();
  return value ? `?${value}` : "";
}

export type AdminPageQuery = {
  q?: string;
  page?: number;
  limit?: number;
};

export async function getAdminDashboard(signal?: AbortSignal): Promise<AdminDashboardData> {
  const body = await request("/api/admin/dashboard", {
    signal,
    fallbackMessage: "Unable to load platform statistics.",
  });
  return parseSuccess(body, (value) => value as AdminDashboardData, "Unexpected dashboard response.");
}

export async function getAdminUsers(
  query: AdminPageQuery & { role?: string; blocked?: string } = {},
  signal?: AbortSignal
) {
  const body = await request(`/api/admin/users${queryString(query)}`, {
    signal,
    fallbackMessage: "Unable to load users.",
  });
  return parsePage(body, parseAdminUser, "Unexpected users response.");
}

export async function getAdminUser(id: string, signal?: AbortSignal): Promise<AdminUser> {
  const body = await request(`/api/admin/users/${encodeURIComponent(id)}`, {
    signal,
    fallbackMessage: "Unable to load user details.",
  });
  return parseSuccess(body, parseAdminUser, "Unexpected user response.");
}

export async function setAdminUserBlocked(id: string, isBlocked: boolean): Promise<AdminUser> {
  const body = await request(`/api/admin/users/${encodeURIComponent(id)}/blocked`, {
    method: "PATCH",
    body: { isBlocked },
    fallbackMessage: "Unable to update this user.",
  });
  return parseSuccess(body, parseAdminUser, "Unexpected user response.");
}

export async function getAdminServices(
  query: AdminPageQuery & {
    approvalStatus?: string;
    isActive?: string;
    category?: string;
  } = {},
  signal?: AbortSignal
) {
  const body = await request(`/api/admin/services${queryString(query)}`, {
    signal,
    fallbackMessage: "Unable to load services.",
  });
  return parsePage(body, parseAdminService, "Unexpected services response.");
}

export async function setAdminServiceApproval(
  id: string,
  approvalStatus: "pending" | "approved" | "rejected",
  rejectionReason?: string
): Promise<VendorService> {
  const body = await request(`/api/admin/services/${encodeURIComponent(id)}/approval`, {
    method: "PATCH",
    body: { approvalStatus, ...(rejectionReason ? { rejectionReason } : {}) },
    fallbackMessage: "Unable to update this service.",
  });
  return parseSuccess(body, parseAdminService, "Unexpected service response.");
}

export async function setAdminServiceActive(id: string, isActive: boolean): Promise<VendorService> {
  const body = await request(`/api/admin/services/${encodeURIComponent(id)}/active`, {
    method: "PATCH",
    body: { isActive },
    fallbackMessage: "Unable to update this service.",
  });
  return parseSuccess(body, parseAdminService, "Unexpected service response.");
}

export async function deleteAdminService(id: string): Promise<void> {
  await request(`/api/admin/services/${encodeURIComponent(id)}`, {
    method: "DELETE",
    fallbackMessage: "Unable to delete this service.",
  });
}

export async function getAdminBookings(
  query: AdminPageQuery & {
    status?: string;
    serviceId?: string;
    customerId?: string;
    vendorId?: string;
  } = {},
  signal?: AbortSignal
) {
  const body = await request(`/api/admin/bookings${queryString(query)}`, {
    signal,
    fallbackMessage: "Unable to load bookings.",
  });
  return parsePage(body, parseAdminBooking, "Unexpected bookings response.");
}

export async function getAdminBooking(id: string, signal?: AbortSignal): Promise<AdminBooking> {
  const body = await request(`/api/admin/bookings/${encodeURIComponent(id)}`, {
    signal,
    fallbackMessage: "Unable to load this booking.",
  });
  return parseSuccess(body, parseAdminBooking, "Unexpected booking response.");
}

export async function getAdminTransactions(
  query: AdminPageQuery & { status?: string; vendorId?: string } = {},
  signal?: AbortSignal
) {
  const body = await request(`/api/admin/transactions${queryString(query)}`, {
    signal,
    fallbackMessage: "Unable to load transactions.",
  });
  return parsePage(body, parseAdminTransaction, "Unexpected transactions response.");
}
