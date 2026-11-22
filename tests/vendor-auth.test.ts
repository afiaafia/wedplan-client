import test from "node:test";
import assert from "node:assert/strict";
import { getVendorSignInDisposition } from "../src/lib/vendor-auth.ts";

test("Customer-only accounts require confirmation before Vendor activation", () => {
  assert.equal(getVendorSignInDisposition(["customer"]), "activate-vendor");
});

test("Vendor and dual-role accounts sign in through the Vendor audience", () => {
  assert.equal(getVendorSignInDisposition(["vendor"]), "vendor");
  assert.equal(
    getVendorSignInDisposition(["customer", "vendor"]),
    "vendor"
  );
});

test("Admin access takes precedence and unsupported roles are rejected", () => {
  assert.equal(getVendorSignInDisposition(["admin"]), "admin");
  assert.equal(
    getVendorSignInDisposition(["admin", "vendor"]),
    "admin"
  );
  assert.equal(getVendorSignInDisposition([]), "unsupported");
});
