import {
  bookingStatusClass,
  formatBookingStatus,
  type CustomerBookingStatus,
} from "@/lib/customer-dashboard";

export default function BookingStatusBadge({
  status,
}: {
  status: CustomerBookingStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${bookingStatusClass(
        status
      )}`}
    >
      {formatBookingStatus(status)}
    </span>
  );
}
