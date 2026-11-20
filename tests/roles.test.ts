import test from "node:test";
import assert from "node:assert/strict";
import {
  getRoleDashboard,
  isRegistrationRole,
  normalizeRole,
} from "../src/lib/roles.ts";

test("role normalization preserves supported roles", () => {
  assert.equal(normalizeRole("customer"), "customer");
  assert.equal(normalizeRole("vendor"), "vendor");
  assert.equal(normalizeRole("admin"), "admin");
});

test("role normalization maps missing or invalid values to customer", () => {
  assert.equal(normalizeRole(undefined), "customer");
  assert.equal(normalizeRole(null), "customer");
  assert.equal(normalizeRole("unknown"), "customer");
});

test("registration role guard excludes admin", () => {
  assert.equal(isRegistrationRole("customer"), true);
  assert.equal(isRegistrationRole("vendor"), true);
  assert.equal(isRegistrationRole("admin"), false);
});

test("each role maps to its own dashboard", () => {
  assert.equal(getRoleDashboard("customer"), "/dashboard/customer");
  assert.equal(getRoleDashboard("vendor"), "/dashboard/vendor");
  assert.equal(getRoleDashboard("admin"), "/dashboard/admin");
});

test("unknown roles fall back to the customer dashboard", () => {
  assert.equal(getRoleDashboard("unknown"), "/dashboard/customer");
  assert.equal(getRoleDashboard(undefined), "/dashboard/customer");
});
