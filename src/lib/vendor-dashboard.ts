export type VendorApprovalStatus = "pending" | "approved" | "rejected";

export type VendorService = {
  id: string;
  title: string;
  category: string;
  price: number;
  images: string[];
  approvalStatus: VendorApprovalStatus;
  isActive: boolean;
  createdAt: string;
};

export type VendorBooking = {
  id: string;
  serviceName: string;
  customerName?: string | null;
  eventDate: string;
  status: string;
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
