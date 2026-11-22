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
    totalBlockedUsers: number;
    totalServices: number;
    pendingServiceApprovals: number;
    approvedServices: number;
    rejectedServices: number;
    totalBookings: number;
    pendingBookings: number;
    acceptedBookings: number;
    rejectedBookings: number;
    cancelledBookings: number;
    totalTransactions: number;
    successfulTransactions: number;
    successfulTransactionAmounts: Array<{
      currency: string;
      amount: number;
    }>;
    premiumVendors: number;
  };
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    image?: string;
    role: "customer" | "vendor" | "admin";
    roles: Array<"customer" | "vendor" | "admin">;
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
  roles: Array<"customer" | "vendor" | "admin">;
  isBlocked: boolean;
  subscriptionPlan: "free" | "premium";
  createdAt: string;
};

export type AdminService = VendorService & {
  vendorId?: string;
  vendorEmail?: string;
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
  stripeSubscriptionId?: string;
  provider: "Stripe";
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

function parseAdminService(value: unknown): AdminService {
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
    images: value.images.filter(
      (image: unknown): image is string => typeof image === "string"
    ),
    approvalStatus: approval,
    ...(typeof value.rejectionReason === "string"
      ? { rejectionReason: value.rejectionReason }
      : {}),
    ...(typeof value.vendorId === "string" ? { vendorId: value.vendorId } : {}),
    ...(typeof value.vendorName === "string" ? { vendorName: value.vendorName } : {}),
    ...(typeof value.vendorEmail === "string"
      ? { vendorEmail: value.vendorEmail }
      : {}),
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
  const roles = Array.isArray(value.roles)
    ? value.roles.filter(
        (item): item is "customer" | "vendor" | "admin" =>
          item === "customer" || item === "vendor" || item === "admin"
      )
    : [];
  if (roles.length === 0) {
    roles.push(role === "vendor" || role === "admin" ? role : "customer");
  }
  return {
    id: value.id,
    name: text(value.name, "Unknown user"),
    email: text(value.email),
    ...(typeof value.image === "string" ? { image: value.image } : {}),
    ...(typeof value.businessName === "string"
      ? { businessName: value.businessName }
      : {}),
    role: role === "vendor" || role === "admin" ? role : "customer",
    roles,
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
  if (value.provider !== "Stripe") {
    throw new AdminApiError("Unexpected transaction provider.");
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
    ...(typeof value.stripeSubscriptionId === "string"
      ? { stripeSubscriptionId: value.stripeSubscriptionId }
      : {}),
    provider: value.provider,
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

function parseAdminDashboardData(value: unknown): AdminDashboardData {
  if (!isRecord(value) || !isRecord(value.stats)) {
    throw new AdminApiError("Unexpected dashboard response.");
  }

  const countKeys = [
    "totalUsers",
    "totalCustomers",
    "totalVendors",
    "totalBlockedUsers",
    "totalServices",
    "pendingServiceApprovals",
    "approvedServices",
    "rejectedServices",
    "totalBookings",
    "pendingBookings",
    "acceptedBookings",
    "rejectedBookings",
    "cancelledBookings",
    "totalTransactions",
    "successfulTransactions",
    "premiumVendors",
  ] as const;
  const stats = value.stats;
  const count = (key: (typeof countKeys)[number]): number => {
    const value = stats[key];
    if (!isFiniteNumber(value) || !Number.isInteger(value) || value < 0) {
      throw new AdminApiError("Unexpected dashboard statistics.");
    }
    return value;
  };
  for (const key of countKeys) {
    count(key);
  }

  if (!Array.isArray(stats.successfulTransactionAmounts)) {
    throw new AdminApiError("Unexpected transaction totals.");
  }
  const successfulTransactionAmounts = stats.successfulTransactionAmounts.map(
    (item) => {
      if (
        !isRecord(item) ||
        typeof item.currency !== "string" ||
        !item.currency.trim() ||
        !isFiniteNumber(item.amount)
      ) {
        throw new AdminApiError("Unexpected transaction totals.");
      }
      return { currency: item.currency, amount: item.amount };
    }
  );

  const recentUsers = parseDashboardRows(
    value.recentUsers,
    (row) => {
      const role: AdminDashboardData["recentUsers"][number]["role"] | null =
        row.role === "customer" || row.role === "vendor" || row.role === "admin"
          ? row.role
          : null;
      if (
        typeof row.id !== "string" ||
        typeof row.name !== "string" ||
        typeof row.email !== "string" ||
        typeof row.createdAt !== "string" ||
        role === null
      ) {
        throw new AdminApiError("Unexpected recent user record.");
      }
      const roles: AdminDashboardData["recentUsers"][number]["roles"] =
        Array.isArray(row.roles)
          ? row.roles.filter(
              (item): item is "customer" | "vendor" | "admin" =>
                item === "customer" || item === "vendor" || item === "admin"
            )
          : [role];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        role,
        roles: roles.length ? roles : [role],
        createdAt: row.createdAt,
        ...(typeof row.image === "string" ? { image: row.image } : {}),
      };
    },
    "recent users"
  );
  const recentServices = parseDashboardRows(
    value.recentServices,
    (row) => {
      if (
        typeof row.id !== "string" ||
        typeof row.title !== "string" ||
        typeof row.category !== "string" ||
        typeof row.approvalStatus !== "string" ||
        typeof row.createdAt !== "string"
      ) {
        throw new AdminApiError("Unexpected recent service record.");
      }
      return {
        id: row.id,
        title: row.title,
        category: row.category,
        approvalStatus: row.approvalStatus,
        createdAt: row.createdAt,
        ...(typeof row.vendorName === "string"
          ? { vendorName: row.vendorName }
          : {}),
        ...(typeof row.image === "string" ? { image: row.image } : {}),
      };
    },
    "recent services"
  );
  const recentBookings = parseDashboardRows(
    value.recentBookings,
    (row) => {
      if (
        typeof row.id !== "string" ||
        typeof row.serviceId !== "string" ||
        typeof row.status !== "string" ||
        typeof row.createdAt !== "string" ||
        typeof row.eventDate !== "string"
      ) {
        throw new AdminApiError("Unexpected recent booking record.");
      }
      return {
        id: row.id,
        serviceId: row.serviceId,
        status: row.status,
        createdAt: row.createdAt,
        eventDate: row.eventDate,
      };
    },
    "recent bookings"
  );
  const recentTransactions = parseDashboardRows(
    value.recentTransactions,
    (row) => {
      if (
        typeof row.id !== "string" ||
        typeof row.plan !== "string" ||
        !isFiniteNumber(row.amount) ||
        typeof row.currency !== "string" ||
        typeof row.status !== "string" ||
        typeof row.createdAt !== "string"
      ) {
        throw new AdminApiError("Unexpected recent transaction record.");
      }
      return {
        id: row.id,
        plan: row.plan,
        amount: row.amount,
        currency: row.currency,
        status: row.status,
        createdAt: row.createdAt,
        ...(typeof row.vendorName === "string"
          ? { vendorName: row.vendorName }
          : {}),
      };
    },
    "recent transactions"
  );

  return {
    stats: {
      totalUsers: count("totalUsers"),
      totalCustomers: count("totalCustomers"),
      totalVendors: count("totalVendors"),
      totalBlockedUsers: count("totalBlockedUsers"),
      totalServices: count("totalServices"),
      pendingServiceApprovals: count("pendingServiceApprovals"),
      approvedServices: count("approvedServices"),
      rejectedServices: count("rejectedServices"),
      totalBookings: count("totalBookings"),
      pendingBookings: count("pendingBookings"),
      acceptedBookings: count("acceptedBookings"),
      rejectedBookings: count("rejectedBookings"),
      cancelledBookings: count("cancelledBookings"),
      totalTransactions: count("totalTransactions"),
      successfulTransactions: count("successfulTransactions"),
      successfulTransactionAmounts,
      premiumVendors: count("premiumVendors"),
    },
    recentUsers,
    recentServices,
    recentBookings,
    recentTransactions,
  };
}

function parseDashboardRows<T>(
  value: unknown,
  parseRow: (row: Record<string, unknown>) => T,
  label: string
): T[] {
  if (!Array.isArray(value)) {
    throw new AdminApiError(`Unexpected ${label} response.`);
  }
  return value.map((row) => {
    if (!isRecord(row)) {
      throw new AdminApiError(`Unexpected ${label} record.`);
    }
    return parseRow(row);
  });
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
  return parseSuccess(body, parseAdminDashboardData, "Unexpected dashboard response.");
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
    vendor?: string;
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
  approvalStatus: "approved" | "rejected",
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
