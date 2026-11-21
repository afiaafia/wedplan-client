import type { VendorApiErrorCode } from "./vendor-api.ts";

export type VendorApprovalStatus = "pending" | "approved" | "rejected";

export type VendorService = {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  price: number;
  images: string[];
  approvalStatus: VendorApprovalStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VendorBooking = {
  id: string;
  serviceId: string;
  customerId: string;
  eventDate: string;
  eventLocation: string;
  message: string;
  status: string;
  createdAt: string;
};

export type VendorOverviewStats = {
  totalServices: number | null;
  activeServices: number | null;
  pendingApproval: number | null;
  totalBookings: number | null;
};

export type VendorOverview = {
  stats: VendorOverviewStats;
  services: VendorService[];
  bookings: VendorBooking[];
};

export type VendorDataState = "loading" | "error" | "empty" | "ready";

export type VendorServiceEditorAction =
  | { kind: "create" }
  | { kind: "edit"; id: string }
  | null;

export type VendorOverviewError = {
  message: string;
  code: VendorApiErrorCode;
} | null;

export const EMPTY_VENDOR_OVERVIEW: VendorOverview = {
  stats: {
    totalServices: null,
    activeServices: null,
    pendingApproval: null,
    totalBookings: null,
  },
  services: [],
  bookings: [],
};

export function getVendorDataState(
  overview: VendorOverview,
  error: string | null
): VendorDataState {
  if (error) return "error";

  const { totalServices, activeServices, pendingApproval, totalBookings } =
    overview.stats;

  if (
    totalServices === null ||
    activeServices === null ||
    pendingApproval === null ||
    totalBookings === null
  ) {
    return "loading";
  }

  if (overview.services.length === 0 && overview.bookings.length === 0) {
    return "empty";
  }

  return "ready";
}

export function resolveBookingServiceName(
  serviceId: string,
  services: VendorService[]
): string {
  return (
    services.find((service) => service.id === serviceId)?.title ||
    "Service listing unavailable"
  );
}

export function getInitials(name?: string | null): string {
  const initials = (name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "V";
}

export function getFirstName(name?: string | null): string {
  return (name || "").trim().split(/\s+/)[0] || "there";
}

export function formatVendorPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatEventDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date to be announced";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatApprovalLabel(status: VendorApprovalStatus): string {
  if (status === "approved") return "Approved";
  if (status === "pending") return "Pending approval";
  return "Rejected";
}

export function formatBookingStatus(status: string): string {
  const normalized = status.trim().toLowerCase();

  if (normalized === "accepted") return "Accepted";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "cancelled") return "Cancelled";
  if (normalized === "pending") return "Pending";
  return status || "Unknown";
}
