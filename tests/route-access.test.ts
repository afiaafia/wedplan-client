import test from "node:test";
import assert from "node:assert/strict";
import {
  isAllowedPostAuthRedirectForRoles,
  isAllowedPostAuthRedirect,
  getSafePostAuthRedirect,
  isProtectedAppPath,
  isRouteAllowedForRole,
  isRouteAllowedForRoles,
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

test("service detail routes require sign-in while the browse page stays public", () => {
  assert.equal(isProtectedAppPath("/services"), false);
  assert.equal(isProtectedAppPath("/services/507f1f77bcf86cd799439011"), true);
  assert.equal(isProtectedAppPath("/services/507f1f77bcf86cd799439011/reviews"), false);
});

test("safe callback destinations return customers, vendors, and admins to service details", () => {
  const callbackURL = "/services/507f1f77bcf86cd799439011?booking=1";
  const baseUrl = "https://wedplan.example/sign-in";

  for (const role of ["customer", "vendor", "admin"] as const) {
    assert.equal(
      getSafePostAuthRedirect(callbackURL, null, baseUrl, [role]),
      callbackURL
    );
  }

  assert.equal(
    getSafePostAuthRedirect(null, "/dashboard/vendor", baseUrl, ["customer"]),
    null
  );
  assert.equal(
    getSafePostAuthRedirect("https://evil.example", null, baseUrl, ["customer"]),
    null
  );
});

test("protected paths remain restricted to their own roles", () => {
  assert.equal(isAllowedPostAuthRedirect("/dashboard/customer/bookings", "customer"), true);
  assert.equal(isAllowedPostAuthRedirect("/dashboard/customer/bookings", "vendor"), false);
  assert.equal(isAllowedPostAuthRedirect("/dashboard/vendor", "vendor"), true);
  assert.equal(isAllowedPostAuthRedirect("/dashboard/vendor", "customer"), false);
  assert.equal(isAllowedPostAuthRedirect("/dashboard/vendor", "admin"), false);
  assert.equal(isAllowedPostAuthRedirect("/dashboard/admin", "admin"), true);
  assert.equal(isAllowedPostAuthRedirect("/settings?tab=profile", "customer"), true);
});

test("multi-role accounts can open both dashboards while single-role users stay isolated", () => {
  const dualRoles = ["customer", "vendor"] as const;
  assert.equal(
    isRouteAllowedForRoles("/dashboard/customer/bookings", dualRoles),
    true
  );
  assert.equal(isRouteAllowedForRoles("/dashboard/vendor", dualRoles), true);
  assert.equal(
    isAllowedPostAuthRedirectForRoles("/dashboard/vendor", dualRoles),
    true
  );
  assert.equal(
    isRouteAllowedForRoles("/dashboard/vendor", ["customer"]),
    false
  );
  assert.equal(
    isRouteAllowedForRoles("/dashboard/admin", dualRoles),
    false
  );
  assert.equal(
    isAllowedPostAuthRedirectForRoles("/dashboard/admin", ["customer", "vendor"]),
    false
  );
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
