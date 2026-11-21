import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-server";
import VendorPageShell from "@/components/dashboard/vendor/vendor-page-shell";
import VendorBookingsClient from "@/components/dashboard/vendor/vendor-bookings-client";

export const instant = false;

export const metadata: Metadata = {
  title: "Booking Requests",
  description: "Review and respond to WedPlan booking requests.",
};

export default async function VendorBookingsPage() {
  await requireRole(["vendor"]);

  return (
    <VendorPageShell
      eyebrow="Vendor workspace"
      title="Booking requests"
      description="Review requests for your services, read the couple's message, and accept or reject pending bookings."
    >
      <VendorBookingsClient />
    </VendorPageShell>
  );
}
