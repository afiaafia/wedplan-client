import type { Metadata } from "next";
import CustomerBookingsClient from "@/components/dashboard/customer/customer-bookings-client";

export const instant = false;

export const metadata: Metadata = {
  title: "My Bookings",
  description: "Review all of your WedPlan booking requests.",
};

export default function CustomerBookingsPage() {
  return <CustomerBookingsClient />;
}
