import test from "node:test";
import assert from "node:assert/strict";
import { hasValidSessionExpiry } from "../src/lib/session-expiry.ts";

const now = Date.parse("2026-11-21T12:00:00.000Z");

test("valid future session expiry is accepted", () => {
  assert.equal(
    hasValidSessionExpiry("2026-11-21T13:00:00.000Z", now),
    true
  );
  assert.equal(hasValidSessionExpiry(new Date(now + 60_000), now), true);
  assert.equal(hasValidSessionExpiry(now + 60_000, now), true);
});

test("expired, missing, and malformed session expiry is rejected", () => {
  for (const value of [
    "2026-11-21T11:00:00.000Z",
    new Date(now),
    now,
    undefined,
    null,
    "not-a-date",
    Number.NaN,
  ]) {
    assert.equal(hasValidSessionExpiry(value, now), false);
  }
});
