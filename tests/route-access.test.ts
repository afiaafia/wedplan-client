import test from "node:test";
import assert from "node:assert/strict";
import {
  isAllowedPostAuthRedirect,
  isProtectedAppPath,
  isRouteAllowedForRole,
} from "../src/lib/route-access.ts";

test("service detail paths are allowed post-auth destinations for every role", () => {
  for (const role of ["customer", "vendor", "admin"] as const) {
    assert.equal(
      isAllowedPostAuthRedirect("/services/507f1f77bcf86cd799439011", role),
      true
    );
    assert.equal(isAllowedPostAuthRedirect("/services", role), true);
    assert.equal(
      isAllowedPostAuthRedirect("/services/507f1f77bcf86cd799439011?booking=1", role),
      true
    );
  }
});

test("protected paths remain restricted to their own roles", () => {
  assert.equal(isAllowedPostAuthRedirect("/dashboard/customer/bookings", "customer"), true);
  assert.equal(isAllowedPostAuthRedirect("/dashboard/customer/bookings", "vendor"), false);
  assert.equal(isAllowedPostAuthRedirect("/dashboard/vendor", "vendor"), true);
  assert.equal(isAllowedPostAuthRedirect("/dashboard/admin", "admin"), true);
  assert.equal(isAllowedPostAuthRedirect("/settings?tab=profile", "customer"), true);
});

test("unrelated or unsafe paths are not treated as service destinations", () => {
  assert.equal(isAllowedPostAuthRedirect("/services/one/two", "customer"), false);
  assert.equal(isAllowedPostAuthRedirect("//evil.example/services", "customer"), false);
  assert.equal(isAllowedPostAuthRedirect("https://evil.example", "customer"), false);
  assert.equal(isAllowedPostAuthRedirect("/", "customer"), false);
});

test("existing access helpers keep their behavior", () => {
  assert.equal(isProtectedAppPath("/dashboard"), true);
  assert.equal(isProtectedAppPath("/services"), false);
  assert.equal(isRouteAllowedForRole("/dashboard/admin", "customer"), false);
  assert.equal(isRouteAllowedForRole("/services", "customer"), true);
});
