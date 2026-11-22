import test from "node:test";
import assert from "node:assert/strict";
import {
  EMPTY_VENDOR_OVERVIEW,
  formatApprovalLabel,
  formatBookingStatus,
  formatCurrencyAmount,
  formatEventDate,
  formatVendorPrice,
  getFirstName,
  getInitials,
} from "../src/lib/vendor-dashboard.ts";
import {
  formatServiceUsage,
  getServiceLimit,
  isValidStripeCheckoutUrl,
  resolveVendorPlan,
} from "../src/lib/subscription.ts";

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

test("currency formatting preserves currency units and safely handles unknown codes", () => {
  assert.equal(formatCurrencyAmount(125.5, "usd"), "$125.50");
  assert.equal(formatCurrencyAmount(12.5, "unknown"), "12.50 UNKNOWN");
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

test("subscription plan resolution only trusts premium with a valid expiry", () => {
  assert.equal(resolveVendorPlan("premium"), "free");
  assert.equal(resolveVendorPlan("premium", null), "free");
  assert.equal(resolveVendorPlan("premium", "not-a-date"), "free");
  assert.equal(resolveVendorPlan("premium", Number.NaN), "free");
  assert.equal(resolveVendorPlan("free"), "free");
  assert.equal(resolveVendorPlan(undefined), "free");
  assert.equal(
    resolveVendorPlan("premium", "2020-01-01T00:00:00.000Z"),
    "free"
  );
  assert.equal(
    resolveVendorPlan("premium", "2999-01-01T00:00:00.000Z"),
    "premium"
  );
});

test("service limits and usage follow the resolved plan", () => {
  assert.equal(getServiceLimit("free"), 3);
  assert.equal(getServiceLimit("premium"), null);
  assert.equal(
    formatServiceUsage(2, "free"),
    "2 / 3 active services used · 1 remaining"
  );
  assert.equal(formatServiceUsage(7, "premium"), "7 active services");
  assert.equal(formatServiceUsage(null, "free"), "Usage unavailable");
});

test("checkout URLs must be HTTPS Stripe Checkout URLs", () => {
  assert.equal(
    isValidStripeCheckoutUrl("https://checkout.stripe.com/c/pay/cs_test_123"),
    true
  );
  assert.equal(isValidStripeCheckoutUrl("https://example.com/checkout"), false);
  assert.equal(isValidStripeCheckoutUrl("javascript:alert(1)"), false);
  assert.equal(isValidStripeCheckoutUrl(""), false);
});
