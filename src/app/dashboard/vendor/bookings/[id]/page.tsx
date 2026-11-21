import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-server";
import VendorPageShell from "@/components/dashboard/vendor/vendor-page-shell";
import VendorBookingDetailClient from "@/components/dashboard/vendor/vendor-booking-detail-client";

export const instant = false;

export const metadata: Metadata = {
  title: "Booking Details",
  description: "Review a WedPlan booking request.",
};

export default async function VendorBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["vendor"]);
  const { id } = await params;

  return (
    <VendorPageShell
      eyebrow="Vendor workspace"
      title="Booking details"
      description="Review the request details before responding to the couple."
    >
      <VendorBookingDetailClient id={id} />
    </VendorPageShell>
  );
}
