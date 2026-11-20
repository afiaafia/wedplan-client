import test from "node:test";
import assert from "node:assert/strict";
import {
  EMPTY_VENDOR_OVERVIEW,
  formatApprovalLabel,
  formatBookingStatus,
  formatEventDate,
  formatVendorPrice,
  getFirstName,
  getInitials,
} from "../src/lib/vendor-dashboard.ts";

test("empty vendor overview contains no fabricated figures", () => {
  assert.deepEqual(EMPTY_VENDOR_OVERVIEW.services, []);
  assert.deepEqual(EMPTY_VENDOR_OVERVIEW.bookings, []);
  assert.equal(EMPTY_VENDOR_OVERVIEW.stats.totalServices, null);
  assert.equal(EMPTY_VENDOR_OVERVIEW.stats.activeServices, null);
  assert.equal(EMPTY_VENDOR_OVERVIEW.stats.pendingApproval, null);
  assert.equal(EMPTY_VENDOR_OVERVIEW.stats.totalBookings, null);
});

test("vendor initials and first name handle missing names", () => {
  assert.equal(getInitials("Amara Okafor"), "AO");
  assert.equal(getInitials("  "), "V");
  assert.equal(getFirstName("Amara Okafor"), "Amara");
  assert.equal(getFirstName(null), "there");
});

test("vendor price formatting uses a stable currency format", () => {
  assert.equal(formatVendorPrice(1250), "$1,250.00");
  assert.equal(formatVendorPrice(99.5), "$99.50");
});

test("event dates format deterministically and handle invalid values", () => {
  assert.equal(formatEventDate("2026-06-18T00:00:00.000Z"), "Jun 18, 2026");
  assert.equal(formatEventDate("not-a-date"), "Date to be announced");
});

test("status labels normalize known booking states", () => {
  assert.equal(formatApprovalLabel("pending"), "Pending approval");
  assert.equal(formatApprovalLabel("approved"), "Approved");
  assert.equal(formatApprovalLabel("rejected"), "Rejected");
  assert.equal(formatBookingStatus("accepted"), "Accepted");
  assert.equal(formatBookingStatus("PENDING"), "Pending");
  assert.equal(formatBookingStatus(""), "Unknown");
});
