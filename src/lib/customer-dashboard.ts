export const CUSTOMER_BOOKING_STATUSES = [
  "Pending",
  "Accepted",
  "Rejected",
  "Cancelled",
] as const;

export type CustomerBookingStatus = (typeof CUSTOMER_BOOKING_STATUSES)[number];

export const CUSTOMER_BOOKING_FILTERS = [
  "all",
  "pending",
  "accepted",
  "rejected",
  "cancelled",
] as const;

export type CustomerBookingFilter = (typeof CUSTOMER_BOOKING_FILTERS)[number];

export interface CustomerBookingService {
  id: string;
  title: string;
  image: string | null;
  category: string | null;
  price: number | null;
}

export interface CustomerBookingVendor {
  id: string;
  name: string | null;
  businessName: string | null;
  profileImage: string | null;
}

export interface CustomerBooking {
  id: string;
  serviceId: string;
  service: CustomerBookingService | null;
  vendorId: string;
  vendor: CustomerBookingVendor | null;
  eventDate: string;
  eventLocation: string;
  message: string;
  status: CustomerBookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDashboardStats {
  totalBookings: number;
  pendingBookings: number;
  acceptedBookings: number;
  rejectedBookings: number;
}

export interface CustomerDashboardData {
  stats: CustomerDashboardStats;
  bookings: CustomerBooking[];
}

export interface CustomerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  businessName: string | null;
  createdAt: string;
  updatedAt: string;
}

export function formatBookingStatus(status: CustomerBookingStatus): string {
  return status;
}

export function bookingStatusClass(status: CustomerBookingStatus): string {
  if (status === "Accepted") return "bg-success/15 text-success";
  if (status === "Pending") return "bg-champagne/20 text-champagne";
  if (status === "Rejected") return "bg-error/15 text-error";
  return "bg-secondary text-muted";
}

export function formatEventDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date to be announced";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatRequestDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatCustomerPrice(value: number | null): string {
  if (value === null) return "Price unavailable";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function vendorDisplayName(vendor: CustomerBookingVendor | null): string {
  if (!vendor) return "Vendor unavailable";
  return vendor.businessName || vendor.name || "Vendor name unavailable";
}

export function serviceDisplayName(service: CustomerBookingService | null): string {
  return service?.title || "Service listing unavailable";
}

export function getCustomerInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "C";
}

export function getCustomerFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "there";
}
