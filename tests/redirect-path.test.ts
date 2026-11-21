import test from "node:test";
import assert from "node:assert/strict";
import { getSafeRedirectPath } from "../src/lib/redirect-path.ts";

const baseUrl = "https://wedplan-client-ten.vercel.app/dashboard/customer";

test("safe redirect paths preserve local paths and query strings", () => {
  assert.equal(
    getSafeRedirectPath("/dashboard/vendor?service=new", baseUrl),
    "/dashboard/vendor?service=new"
  );
  assert.equal(getSafeRedirectPath("/", baseUrl), "/");
});

test("safe redirect paths reject protocol-relative and external values", () => {
  assert.equal(getSafeRedirectPath("//evil.com", baseUrl), null);
  assert.equal(getSafeRedirectPath("https://evil.com", baseUrl), null);
  assert.equal(getSafeRedirectPath("dashboard/vendor", baseUrl), null);
  assert.equal(getSafeRedirectPath(null, baseUrl), null);
});

test("safe redirect paths reject encoded control characters and backslashes", () => {
  assert.equal(getSafeRedirectPath("/%09/evil.com", baseUrl), null);
  assert.equal(getSafeRedirectPath("/\t/evil.com", baseUrl), null);
  assert.equal(getSafeRedirectPath("/\\evil.com", baseUrl), null);
  assert.equal(getSafeRedirectPath("/\n/evil.com", baseUrl), null);
});
