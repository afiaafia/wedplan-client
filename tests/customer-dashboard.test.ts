import test from "node:test";
import assert from "node:assert/strict";
import {
  CustomerApiError,
  cancelCustomerBooking,
  getCustomerBookings,
  getCustomerDashboard,
  messageForCustomerApiError,
  updateCustomerProfile,
  validateProfileImage,
} from "../src/lib/customer-api.ts";
import {
  formatEventDate,
  getCustomerInitials,
  vendorDisplayName,
} from "../src/lib/customer-dashboard.ts";

const BOOKING = {
  id: "65b000000000000000000099",
  serviceId: "65b000000000000000000001",
  service: {
    id: "65b000000000000000000001",
    title: "Garden photography",
    image: "https://i.imgbb.com/photo.png",
    category: "Photography",
    price: 850,
  },
  vendorId: "65b000000000000000000002",
  vendor: {
    id: "65b000000000000000000002",
    name: "Ayesha Khan",
    businessName: "Elegant Moments",
    profileImage: null,
  },
  eventDate: "2027-06-15T00:00:00.000Z",
  eventLocation: "Garden Banquet Hall",
  message: "Evening reception included.",
  status: "Pending",
  createdAt: "2026-11-21T10:00:00.000Z",
  updatedAt: "2026-11-21T10:00:00.000Z",
};

type RequestRecord = { url: string; init?: RequestInit };

function stubFetch(handler: (request: RequestRecord) => { status: number; body: unknown }) {
  const requests: RequestRecord[] = [];
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = { url: String(input), init };
    requests.push(request);
    const result = handler(request);
    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  return { fetchImpl, requests };
}

test("customer dashboard requests include session credentials and parse live data", async () => {
  const { fetchImpl, requests } = stubFetch(() => ({
    status: 200,
    body: {
      success: true,
      data: {
        stats: {
          totalBookings: 4,
          pendingBookings: 1,
          acceptedBookings: 2,
          rejectedBookings: 1,
        },
        bookings: [BOOKING],
      },
      meta: { recentLimit: 5 },
    },
  }));

  const dashboard = await getCustomerDashboard({
    headers: { Cookie: "better-auth.session=abc" },
    fetchImpl,
  });

  assert.equal(requests[0]?.url, "http://localhost:5000/api/customer/dashboard?limit=5");
  assert.equal(requests[0]?.init?.method, "GET");
  assert.equal(requests[0]?.init?.credentials, "include");
  assert.deepEqual(requests[0]?.init?.headers, {
    Accept: "application/json",
    Cookie: "better-auth.session=abc",
  });
  assert.deepEqual(dashboard.stats, {
    totalBookings: 4,
    pendingBookings: 1,
    acceptedBookings: 2,
    rejectedBookings: 1,
  });
  assert.equal(dashboard.bookings[0]?.service?.title, "Garden photography");
});

test("booking history builds filters and reads pagination from response meta", async () => {
  const { fetchImpl, requests } = stubFetch(() => ({
    status: 200,
    body: {
      success: true,
      data: [BOOKING],
      meta: {
        page: 2,
        limit: 10,
        total: 15,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    },
  }));

  const result = await getCustomerBookings({ page: 2, status: "all" }, { fetchImpl });

  assert.equal(
    requests[0]?.url,
    "http://localhost:5000/api/customer/bookings?page=2"
  );
  assert.equal(result.pagination.total, 15);
  assert.equal(result.pagination.hasPreviousPage, true);
  assert.equal(result.bookings[0]?.status, "Pending");
});

test("cancellation and profile updates send only allowed client fields", async () => {
  const { fetchImpl, requests } = stubFetch((request) => ({
    status: 200,
    body: { success: true, data: request.url.includes("cancel") ? BOOKING : {
      id: "65b000000000000000000010",
      name: "Updated Name",
      email: "customer@example.com",
      image: null,
      businessName: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-11-21T10:00:00.000Z",
    } },
  }));

  await cancelCustomerBooking(BOOKING.id, { fetchImpl });
  await updateCustomerProfile("  Updated Name  ", { fetchImpl });

  assert.equal(requests[0]?.url, `http://localhost:5000/api/customer/bookings/${BOOKING.id}/cancel`);
  assert.equal(requests[0]?.init?.method, "POST");
  assert.equal(requests[0]?.init?.body, undefined);

  assert.equal(requests[1]?.url, "http://localhost:5000/api/customer/profile");
  assert.equal(requests[1]?.init?.method, "PATCH");
  assert.deepEqual(JSON.parse(String(requests[1]?.init?.body)), { name: "  Updated Name  " });
});

test("customer API errors preserve backend codes and validation details", async () => {
  const { fetchImpl } = stubFetch(() => ({
    status: 409,
    body: {
      success: false,
      error: {
        message: "Only pending bookings can be cancelled",
        code: "BOOKING_NOT_CANCELLABLE",
        details: [{ field: "id", message: "Booking cannot be cancelled" }],
      },
    },
  }));

  await cancelCustomerBooking(BOOKING.id, { fetchImpl }).then(
    () => assert.fail("expected an error"),
    (error: unknown) => {
      assert.ok(error instanceof CustomerApiError);
      assert.equal(error.status, 409);
      assert.equal(error.code, "BOOKING_NOT_CANCELLABLE");
      assert.equal(error.message, "Only pending bookings can be cancelled");
      assert.deepEqual(error.details, [
        { field: "id", message: "Booking cannot be cancelled" },
      ]);
    }
  );

  assert.match(
    messageForCustomerApiError(new Error("broken")),
    /couldn't complete/i
  );
});

test("invalid responses and malformed payloads are rejected", async () => {
  const invalid = stubFetch(() => ({ status: 200, body: { unexpected: true } }));
  await getCustomerDashboard({ fetchImpl: invalid.fetchImpl }).then(
    () => assert.fail("expected an error"),
    (error: unknown) => {
      assert.ok(error instanceof CustomerApiError);
      assert.equal(error.code, "INVALID_RESPONSE");
    }
  );

  const malformed = stubFetch(() => ({
    status: 200,
    body: { success: true, data: { stats: {}, bookings: "nope" } },
  }));
  await getCustomerDashboard({ fetchImpl: malformed.fetchImpl }).then(
    () => assert.fail("expected an error"),
    (error: unknown) => {
      assert.ok(error instanceof CustomerApiError);
      assert.equal(error.code, "UNEXPECTED_RESPONSE");
    }
  );
});

test("profile image validation and customer display helpers are deterministic", () => {
  const valid = new File(["a"], "avatar.png", { type: "image/png" });
  const invalid = new File(["a"], "notes.txt", { type: "text/plain" });

  assert.equal(validateProfileImage(valid), null);
  assert.match(String(validateProfileImage(invalid)), /JPEG, PNG, GIF, or WebP/);
  assert.equal(formatEventDate("2027-06-15T00:00:00.000Z"), "Jun 15, 2027");
  assert.equal(formatEventDate("invalid"), "Date to be announced");
  assert.equal(getCustomerInitials("  amina raza  "), "AR");
  assert.equal(getCustomerInitials(""), "C");
  assert.equal(vendorDisplayName(BOOKING.vendor), "Elegant Moments");
  assert.equal(vendorDisplayName(null), "Vendor unavailable");
});
