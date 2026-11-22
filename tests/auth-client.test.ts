import test from "node:test";
import assert from "node:assert/strict";
import {
  authErrorMessage,
  authQueryErrorMessage,
} from "../src/lib/auth-errors.ts";
import { validateSignUpPassword } from "../src/lib/password.ts";
import { isAllowedPostAuthDestination } from "../src/lib/route-access.ts";
import {
  claimGoogleOAuthFlow,
  clearGoogleOAuthFlow,
  GOOGLE_OAUTH_STATE_TTL_MS,
  hasPendingGoogleOAuthFlow,
} from "../src/lib/google-oauth-flow.ts";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
    key: (index) => Array.from(values.keys())[index] ?? null,
    get length() {
      return values.size;
    },
  };
}

test("backend auth error codes are translated into user-friendly messages", () => {
  assert.match(authErrorMessage({ code: "ACCOUNT_BLOCKED" }), /blocked/i);
  assert.match(authErrorMessage({ code: "INVALID_EMAIL_PASSWORD" }), /incorrect/i);
  assert.match(authErrorMessage({ code: "INVALID_REGISTRATION_ROLE" }), /customer or vendor/i);
  assert.equal(
    authErrorMessage({ code: "UNKNOWN_CODE", message: "Custom error" }),
    "Custom error"
  );
  assert.equal(authErrorMessage({}), "Something went wrong. Please try again.");
});

test("OAuth query errors are mapped and descriptions are bounded", () => {
  assert.equal(authQueryErrorMessage(null, null), "");
  assert.match(authQueryErrorMessage("access_denied", null), /cancelled/i);
  assert.match(authQueryErrorMessage("not_vendor", null), /Customer Sign In/);
  assert.equal(
    authQueryErrorMessage("oauth_failed", "Provider unavailable"),
    "Provider unavailable"
  );
  assert.equal(
    authQueryErrorMessage("oauth_failed", "x".repeat(200)),
    "Authentication could not be completed. Please try again."
  );
  assert.equal(
    authQueryErrorMessage("oauth_failed", "<script>alert(1)</script>"),
    "Authentication could not be completed. Please try again."
  );
});

test("client password rules mirror the backend policy", () => {
  assert.equal(validateSignUpPassword("Abcdef"), null);
  assert.match(validateSignUpPassword("abcdef") ?? "", /uppercase/);
  assert.match(validateSignUpPassword("ABCDEF") ?? "", /lowercase/);
  assert.match(validateSignUpPassword("Abcde") ?? "", /at least 6/);
  assert.match(validateSignUpPassword("Ab".repeat(65)) ?? "", /at most 128/);
});

test("Google post-auth destinations stay inside WedPlan", () => {
  assert.equal(isAllowedPostAuthDestination("/dashboard/customer/bookings"), true);
  assert.equal(isAllowedPostAuthDestination("/dashboard/vendor"), true);
  assert.equal(isAllowedPostAuthDestination("/services/123?booking=1"), true);
  assert.equal(isAllowedPostAuthDestination("https://evil.example"), false);
  assert.equal(isAllowedPostAuthDestination("//evil.example/services"), false);
  assert.equal(isAllowedPostAuthDestination("/dashboard/admin"), true);
});

test("Google OAuth state cannot be overwritten by a concurrent tab", () => {
  const storage = createMemoryStorage();
  const firstFlow = claimGoogleOAuthFlow(storage, 1000);
  assert.ok(firstFlow);
  assert.equal(claimGoogleOAuthFlow(storage, 2000), null);
  assert.equal(hasPendingGoogleOAuthFlow(storage, 2000), true);
  const secondFlow = claimGoogleOAuthFlow(
    storage,
    1000 + GOOGLE_OAUTH_STATE_TTL_MS + 1
  );
  assert.ok(secondFlow);
  clearGoogleOAuthFlow(storage, firstFlow);
  assert.equal(hasPendingGoogleOAuthFlow(storage, 1000 + GOOGLE_OAUTH_STATE_TTL_MS + 2), true);
  clearGoogleOAuthFlow(storage, secondFlow);
  assert.equal(hasPendingGoogleOAuthFlow(storage, 1000), false);
});
