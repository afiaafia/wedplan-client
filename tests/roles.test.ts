import test from "node:test";
import assert from "node:assert/strict";
import {
  hasRole,
  getPrimaryRole,
  getRoleDashboard,
  isRegistrationRole,
  normalizeRole,
  normalizeRoles,
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

test("multi-role accounts retain both capabilities and legacy accounts fall back safely", () => {
  assert.deepEqual(normalizeRoles(["customer", "vendor"], "customer"), [
    "customer",
    "vendor",
  ]);
  assert.deepEqual(normalizeRoles(undefined, "vendor"), ["vendor"]);
  assert.deepEqual(normalizeRoles([], "vendor"), []);
  assert.deepEqual(normalizeRoles(["invalid"], "vendor"), []);
  assert.equal(hasRole(["customer", "vendor"], "vendor", "customer"), true);
  assert.equal(hasRole(["customer"], "vendor", "customer"), false);
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

test("Admin has redirect priority when the account has multiple roles", () => {
  const roles = ["customer", "vendor", "admin"];
  assert.equal(getPrimaryRole("customer", roles), "admin");
  assert.equal(getRoleDashboard("customer", roles), "/dashboard/admin");
});

test("unknown roles fall back to the customer dashboard", () => {
  assert.equal(getRoleDashboard("unknown"), "/dashboard/customer");
  assert.equal(getRoleDashboard(undefined), "/dashboard/customer");
});
