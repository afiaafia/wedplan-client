import test from "node:test";
import assert from "node:assert/strict";
import {
  activateVendorAccess,
  setProfilePassword,
} from "../src/lib/profile-api.ts";

test("Vendor activation uses the authenticated endpoint without client role data", async () => {
  const originalFetch = globalThis.fetch;
  let captured: { url: URL; init?: RequestInit } | undefined;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    captured = { url: new URL(String(input)), init };
    return new Response(
      JSON.stringify({
        success: true,
        data: { roles: ["customer", "vendor"] },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }) as typeof fetch;

  try {
    const result = await activateVendorAccess();
    assert.equal(captured?.url.pathname, "/api/me/roles/vendor");
    assert.equal(captured?.init?.method, "POST");
    assert.equal(captured?.init?.credentials, "include");
    assert.equal(captured?.init?.body, undefined);
    assert.deepEqual(result.roles, ["customer", "vendor"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("setting a password uses the current session without sending a user id", async () => {
  const originalFetch = globalThis.fetch;
  let captured: { url: URL; init?: RequestInit } | undefined;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    captured = { url: new URL(String(input)), init };
    return new Response(
      JSON.stringify({
        success: true,
        data: { passwordSet: true },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }) as typeof fetch;

  try {
    const result = await setProfilePassword("AdminPass1");
    const body = JSON.parse(String(captured?.init?.body)) as Record<
      string,
      unknown
    >;
    assert.equal(captured?.url.pathname, "/api/me/password");
    assert.equal(captured?.init?.method, "POST");
    assert.equal(captured?.init?.credentials, "include");
    assert.equal(body.newPassword, "AdminPass1");
    assert.equal("userId" in body, false);
    assert.equal(result.passwordSet, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
