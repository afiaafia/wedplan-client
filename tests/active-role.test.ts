import test from "node:test";
import assert from "node:assert/strict";
import {
  clearActiveRoleSelection,
  readActiveRoleSelection,
  resolvePostAuthDestination,
  saveActiveRoleSelection,
} from "../src/lib/active-role.ts";

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

test("single-role accounts go directly to their only dashboard", () => {
  assert.deepEqual(resolvePostAuthDestination(["vendor"], null), {
    activeRole: "vendor",
    target: "/dashboard/vendor",
  });
  assert.deepEqual(resolvePostAuthDestination(["customer"], null), {
    activeRole: "customer",
    target: "/dashboard/customer",
  });
});

test("multi-role accounts choose a role and do not reuse it after sign-out", () => {
  const roles = ["customer", "vendor"] as const;
  const storage = createStorage();

  assert.deepEqual(resolvePostAuthDestination(roles, null), {
    activeRole: null,
    target: "/dashboard",
  });

  const customerChoice = resolvePostAuthDestination(
    roles,
    null,
    "customer"
  );
  assert.equal(customerChoice.target, "/dashboard/customer");
  assert.equal(
    saveActiveRoleSelection(storage, "session-1", "customer", roles),
    true
  );
  assert.equal(
    readActiveRoleSelection(storage, "session-1", roles),
    "customer"
  );

  clearActiveRoleSelection(storage);
  assert.equal(readActiveRoleSelection(storage, "session-1", roles), null);

  const nextSignIn = resolvePostAuthDestination(roles, null);
  assert.equal(nextSignIn.target, "/dashboard");
  assert.equal(
    readActiveRoleSelection(storage, "session-2", roles),
    null
  );

  const secondCustomerChoice = resolvePostAuthDestination(
    roles,
    null,
    "customer"
  );
  assert.equal(secondCustomerChoice.target, "/dashboard/customer");
  assert.equal(
    saveActiveRoleSelection(storage, "session-2", "customer", roles),
    true
  );
  assert.equal(
    readActiveRoleSelection(storage, "session-2", roles),
    "customer"
  );

  clearActiveRoleSelection(storage);
  assert.equal(
    resolvePostAuthDestination(roles, null).target,
    "/dashboard"
  );

  const vendorChoice = resolvePostAuthDestination(roles, null, "vendor");
  assert.equal(vendorChoice.target, "/dashboard/vendor");
  assert.equal(
    saveActiveRoleSelection(storage, "session-3", "vendor", roles),
    true
  );
  assert.equal(
    readActiveRoleSelection(storage, "session-3", roles),
    "vendor"
  );
});

test("active-role records are rejected when the authenticated session changes", () => {
  const roles = ["customer", "vendor"] as const;
  const storage = createStorage();
  saveActiveRoleSelection(storage, "session-before-sign-out", "vendor", roles);

  assert.equal(
    readActiveRoleSelection(storage, "session-after-sign-in", roles),
    null
  );
  assert.equal(
    readActiveRoleSelection(storage, "session-before-sign-out", roles),
    null
  );
});

test("role-specific callbacks are preserved only for authorized active roles", () => {
  const roles = ["customer", "vendor"] as const;
  assert.deepEqual(
    resolvePostAuthDestination(
      roles,
      "/dashboard/customer/bookings?status=upcoming"
    ),
    {
      activeRole: "customer",
      target: "/dashboard/customer/bookings?status=upcoming",
    }
  );
  assert.deepEqual(
    resolvePostAuthDestination(
      roles,
      "/dashboard/customer",
      "vendor"
    ),
    { activeRole: "vendor", target: "/dashboard/vendor" }
  );
});

test("Admin remains the active role and cannot be changed by role selection", () => {
  const roles = ["customer", "vendor", "admin"] as const;
  const storage = createStorage();

  assert.deepEqual(
    resolvePostAuthDestination(roles, "/dashboard/vendor", "customer"),
    { activeRole: "admin", target: "/dashboard/admin" }
  );
  assert.equal(
    saveActiveRoleSelection(storage, "admin-session", "vendor", roles),
    false
  );
  assert.equal(
    saveActiveRoleSelection(storage, "admin-session", "admin", roles),
    true
  );
});
