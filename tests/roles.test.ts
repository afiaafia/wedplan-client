import test from "node:test";
import assert from "node:assert/strict";
import {
  hasRole,
  getDefaultDashboardRole,
  getDashboardEntryPath,
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

test("ambiguous roles use the role-selection entry instead of choosing Vendor", () => {
  assert.equal(getDefaultDashboardRole(["customer", "vendor"]), null);
  assert.equal(getDashboardEntryPath(["customer", "vendor"]), "/dashboard");
  assert.equal(getDefaultDashboardRole(["vendor"]), "vendor");
  assert.equal(getDashboardEntryPath(["vendor"]), "/dashboard/vendor");
});

test("Admin remains the default dashboard role for accounts with multiple roles", () => {
  assert.equal(
    getDefaultDashboardRole(["customer", "vendor", "admin"]),
    "admin"
  );
  assert.equal(
    getDashboardEntryPath(["customer", "vendor", "admin"]),
    "/dashboard/admin"
  );
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
