import test from "node:test";
import assert from "node:assert/strict";
import {
  AdminServicesApiError,
  getServicesForReview,
  parseApprovalResponse,
  parseServicesForReviewResponse,
  setServiceApproval,
} from "../src/lib/admin-services-api.ts";
import type { VendorService } from "../src/lib/vendor-dashboard.ts";

type RequestRecord = { url: string; init?: RequestInit };

function stubFetch(
  t: { after: (callback: () => void) => void },
  handler: (request: RequestRecord) => { status: number; body: unknown }
): RequestRecord[] {
  const originalFetch = globalThis.fetch;
  const requests: RequestRecord[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = { url: String(input), init };
    requests.push(request);
    const result = handler(request);
    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  return requests;
}

const service: VendorService = {
  id: "65b000000000000000000001",
  title: "Garden photography",
  category: "Photography",
  description: "Full-day wedding coverage",
  location: "Lagos",
  price: 1250,
  images: ["https://images.unsplash.com/photo-1"],
  approvalStatus: "pending",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

test("review responses require the backend envelope and real records", () => {
  assert.deepEqual(parseServicesForReviewResponse({ success: true, data: [service] }), [service]);
  assert.deepEqual(parseApprovalResponse({ success: true, data: service }), service);

  assert.throws(
    () => parseServicesForReviewResponse({ success: true, data: [{ ...service, approvalStatus: "maybe" }] }),
    (error: unknown) => error instanceof AdminServicesApiError
  );
  assert.throws(
    () => parseApprovalResponse({ success: false, data: service }),
    (error: unknown) => error instanceof AdminServicesApiError
  );
});

test("review list is fetched with session credentials", (t) => {
  const requests = stubFetch(t, () => ({
    status: 200,
    body: { success: true, data: [service] },
  }));

  return getServicesForReview().then((services) => {
    assert.equal(requests[0]?.url, "http://localhost:5000/api/admin/services");
    assert.equal(requests[0]?.init?.credentials, "include");
    assert.equal(requests[0]?.init?.cache, "no-store");
    assert.deepEqual(services, [service]);
  });
});

test("approval sends only the status and never ownership or activation", (t) => {
  const requests = stubFetch(t, () => ({
    status: 200,
    body: { success: true, data: { ...service, approvalStatus: "approved" } },
  }));

  return setServiceApproval(service.id, "approved").then((updated) => {
    assert.equal(
      requests[0]?.url,
      `http://localhost:5000/api/admin/services/${service.id}/approval`
    );
    assert.equal(requests[0]?.init?.method, "PATCH");
    assert.deepEqual(JSON.parse(String(requests[0]?.init?.body)), {
      approvalStatus: "approved",
    });
    assert.equal(updated.approvalStatus, "approved");
  });
});

test("admin errors preserve the backend status and code", (t) => {
  stubFetch(t, () => ({
    status: 403,
    body: {
      success: false,
      error: { code: "ADMIN_ACCESS_REQUIRED", message: "Admins only" },
    },
  }));

  return setServiceApproval(service.id, "approved").then(
    () => assert.fail("approval should have been rejected"),
    (error: unknown) => {
      assert.ok(error instanceof AdminServicesApiError);
      assert.equal(error.status, 403);
      assert.equal(error.code, "ADMIN_ACCESS_REQUIRED");
      assert.equal(error.message, "Admins only");
    }
  );
});
