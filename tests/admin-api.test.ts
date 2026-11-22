import test from "node:test";
import assert from "node:assert/strict";
import {
  AdminApiError,
  getAdminDashboard,
  getAdminServices,
  getAdminTransactions,
} from "../src/lib/admin-api.ts";

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

function dashboardData() {
  return {
    stats: {
      totalUsers: 10,
      totalCustomers: 6,
      totalVendors: 4,
      totalBlockedUsers: 1,
      totalServices: 8,
      pendingServiceApprovals: 2,
      approvedServices: 5,
      rejectedServices: 1,
      totalBookings: 9,
      pendingBookings: 2,
      acceptedBookings: 3,
      rejectedBookings: 2,
      cancelledBookings: 2,
      totalTransactions: 4,
      successfulTransactions: 2,
      successfulTransactionAmounts: [
        { currency: "usd", amount: 125.5 },
        { currency: "ngn", amount: 5000 },
      ],
      premiumVendors: 3,
    },
    recentUsers: [],
    recentServices: [],
    recentBookings: [],
    recentTransactions: [],
  };
}

test("Admin dashboard validates and returns all status counts and currency totals", (t) => {
  stubFetch(t, () => ({
    status: 200,
    body: { success: true, data: dashboardData() },
  }));

  return getAdminDashboard().then((result) => {
    assert.equal(result.stats.totalBlockedUsers, 1);
    assert.equal(result.stats.approvedServices, 5);
    assert.equal(result.stats.cancelledBookings, 2);
    assert.equal(result.stats.successfulTransactions, 2);
    assert.deepEqual(result.stats.successfulTransactionAmounts, [
      { currency: "usd", amount: 125.5 },
      { currency: "ngn", amount: 5000 },
    ]);
  });
});

test("Admin dashboard rejects invalid counts instead of displaying false totals", (t) => {
  const data = dashboardData();
  data.stats.totalBookings = -1;
  stubFetch(t, () => ({
    status: 200,
    body: { success: true, data },
  }));

  return getAdminDashboard().then(
    () => assert.fail("expected an invalid dashboard response to be rejected"),
    (error: unknown) => {
      assert.ok(error instanceof AdminApiError);
      assert.match(error.message, /dashboard statistics/i);
    }
  );
});

test("Admin service queries filter by vendor name or email and retain contact details", (t) => {
  const requests = stubFetch(t, () => ({
    status: 200,
    body: {
      success: true,
      data: [
        {
          id: "65b000000000000000000001",
          title: "Garden photography",
          category: "Photography",
          description: "Documenting the day",
          location: "Lagos",
          price: 450000,
          images: [],
          approvalStatus: "approved",
          vendorId: "65b000000000000000000002",
          vendorName: "Camille Studio",
          vendorEmail: "camille@example.com",
          isActive: true,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
  }));

  return getAdminServices({ vendor: "camille@example.com", page: 1, limit: 10 }).then(
    (result) => {
      const requestUrl = new URL(requests[0]!.url);
      assert.equal(requestUrl.searchParams.get("vendor"), "camille@example.com");
      assert.equal(requests[0]?.init?.credentials, "include");
      assert.equal(result.items[0]?.vendorEmail, "camille@example.com");
      assert.equal(result.items[0]?.vendorName, "Camille Studio");
    }
  );
});

test("Admin transaction records include the provider and subscription reference", (t) => {
  stubFetch(t, () => ({
    status: 200,
    body: {
      success: true,
      data: [
        {
          id: "transaction-1",
          vendorId: "vendor-1",
          plan: "premium",
          amount: 75,
          currency: "usd",
          status: "completed",
          createdAt: "2026-01-01T00:00:00.000Z",
          provider: "Stripe",
          stripeSessionId: "cs_test_123",
          stripeSubscriptionId: "sub_123",
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
  }));

  return getAdminTransactions().then((result) => {
    assert.equal(result.items[0]?.provider, "Stripe");
    assert.equal(result.items[0]?.stripeSubscriptionId, "sub_123");
  });
});
