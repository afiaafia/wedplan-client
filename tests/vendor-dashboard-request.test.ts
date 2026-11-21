import test from "node:test";
import assert from "node:assert/strict";
import { getServerApiBaseUrl } from "../src/lib/api-url.ts";
import { requestVendorDashboard } from "../src/lib/vendor-dashboard-request.ts";

const dashboardBody = {
  success: true,
  data: {
    stats: {
      totalServices: 1,
      activeServices: 1,
      pendingApproval: 0,
      totalBookings: 1,
    },
    services: [
      {
        id: "65b000000000000000000001",
        title: "Garden photography",
        category: "Photography",
        description: "Full-day coverage",
        location: "Lagos",
        price: 1250,
        images: ["https://example.com/photo.jpg"],
        approvalStatus: "approved",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
    ],
    bookings: [
      {
        id: "65c000000000000000000001",
        serviceId: "65b000000000000000000001",
        customerId: "65d000000000000000000001",
        eventDate: "2026-06-18T00:00:00.000Z",
        eventLocation: "Lagos",
        message: "Please call before the event",
        status: "Pending",
        createdAt: "2026-02-01T00:00:00.000Z",
      },
    ],
  },
};

type RequestRecord = { url: string; init?: RequestInit };

function stubFetch(
  status: number,
  body: unknown,
  requests: RequestRecord[],
  raw = false
): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    requests.push({ url: String(input), init });
    return new Response(raw ? String(body) : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

test("server API URL uses runtime server configuration before public build-time values", () => {
  assert.equal(
    getServerApiBaseUrl({
      BETTER_AUTH_URL: "https://auth.example.com/",
      NEXT_PUBLIC_API_URL: "https://public.example.com",
    }),
    "https://auth.example.com"
  );
  assert.equal(
    getServerApiBaseUrl({ NEXT_PUBLIC_API_URL: "https://public.example.com" }),
    "https://public.example.com"
  );
  assert.equal(getServerApiBaseUrl({}), "http://localhost:5000");
});

test("server dashboard request forwards Better Auth cookies to the server API", async (t) => {
  const previous = process.env.API_INTERNAL_URL;
  process.env.API_INTERNAL_URL = "https://api.example.com/";
  t.after(() => {
    if (previous === undefined) delete process.env.API_INTERNAL_URL;
    else process.env.API_INTERNAL_URL = previous;
  });

  const requests: RequestRecord[] = [];
  const result = await requestVendorDashboard(
    "better-auth.session_token=abc123; other=1",
    stubFetch(200, dashboardBody, requests)
  );

  assert.equal(result.ok, true);
  assert.equal(
    requests[0]?.url,
    "https://api.example.com/api/vendor/dashboard"
  );
  assert.equal(requests[0]?.init?.method, "GET");
  assert.equal(requests[0]?.init?.cache, "no-store");
  assert.deepEqual(requests[0]?.init?.headers, {
    Accept: "application/json",
    Cookie: "better-auth.session_token=abc123; other=1",
  });

  if (result.ok) {
    assert.equal(result.overview.stats.totalBookings, 1);
    assert.equal(result.overview.bookings[0]?.serviceId, dashboardBody.data.services[0]?.id);
  }
});

test("server dashboard request maps expired sessions and malformed responses", async () => {
  const unauthorized = await requestVendorDashboard(
    "better-auth.session_token=expired",
    stubFetch(
      401,
      { success: false, error: { code: "UNAUTHORIZED", message: "Expired" } },
      []
    )
  );

  assert.deepEqual(unauthorized, {
    ok: false,
    message: "Your session has expired. Please sign in again to continue.",
    status: 401,
    code: "UNAUTHORIZED",
  });

  const invalidJson = await requestVendorDashboard(
    "session=1",
    stubFetch(200, "not json", [], true)
  );
  assert.equal(invalidJson.ok, false);
  if (!invalidJson.ok) {
    assert.equal(invalidJson.code, "INVALID_RESPONSE");
    assert.equal(invalidJson.status, 200);
  }

  const unexpected = await requestVendorDashboard(
    "session=1",
    stubFetch(200, { success: true, data: { stats: {} } }, [])
  );
  assert.equal(unexpected.ok, false);
  if (!unexpected.ok) {
    assert.equal(unexpected.code, "UNEXPECTED_RESPONSE");
  }
});
