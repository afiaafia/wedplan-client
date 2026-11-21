import type { Metadata } from "next";
import CustomerBookingDetails from "@/components/dashboard/customer/customer-booking-details";

export const instant = false;

export const metadata: Metadata = {
  title: "Booking Details",
  description: "Review the details of a WedPlan booking request.",
};

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

export default async function CustomerBookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isValidId = OBJECT_ID_PATTERN.test(id);

  return (
    <CustomerBookingDetails bookingId={isValidId ? id : "invalid-booking-id"} />
  );
}
