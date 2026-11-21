import test from "node:test";
import assert from "node:assert/strict";
import {
  BookingApiError,
  createBookingRequest,
  formatBookingDate,
  messageForBookingError,
  type BookingConfirmation,
} from "../src/lib/bookings-api.ts";
import {
  parseDateOnly,
  validateBookingForm,
} from "../src/lib/booking-form.ts";

const SERVICE_ID = "65b000000000000000000001";

const confirmation: BookingConfirmation = {
  id: "65b000000000000000000099",
  serviceId: SERVICE_ID,
  serviceTitle: "Garden photography",
  vendorId: "65b000000000000000000002",
  eventDate: "2027-06-15T00:00:00.000Z",
  eventLocation: "Garden Banquet Hall",
  message: "Evening reception included.",
  status: "Pending",
  createdAt: "2026-11-21T10:00:00.000Z",
};

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

test("booking requests send only client-owned fields with session credentials", (t) => {
  const requests = stubFetch(t, () => ({
    status: 201,
    body: { success: true, data: confirmation },
  }));

  return createBookingRequest({
    serviceId: SERVICE_ID,
    eventDate: "2027-06-15",
    eventLocation: " Garden Banquet Hall ",
    message: " Evening reception included. ",
  }).then((booking) => {
    assert.equal(requests[0]?.url, "http://localhost:5000/api/bookings");
    assert.equal(requests[0]?.init?.method, "POST");
    assert.equal(requests[0]?.init?.credentials, "include");
    assert.deepEqual(JSON.parse(String(requests[0]?.init?.body)), {
      serviceId: SERVICE_ID,
      eventDate: "2027-06-15",
      eventLocation: " Garden Banquet Hall ",
      message: " Evening reception included. ",
    });
    assert.deepEqual(booking, confirmation);
  });
});

test("booking errors preserve backend codes and field details", (t) => {
  stubFetch(t, () => ({
    status: 400,
    body: {
      success: false,
      error: {
        message: "Invalid request parameters",
        code: "VALIDATION_ERROR",
        details: [{ field: "eventDate", message: "Event date must be in the future" }],
      },
    },
  }));

  return createBookingRequest({
    serviceId: SERVICE_ID,
    eventDate: "2020-01-01",
    eventLocation: "Garden Banquet Hall",
    message: "",
  }).then(
    () => assert.fail("expected an error"),
    (error: unknown) => {
      assert.ok(error instanceof BookingApiError);
      assert.equal(error.status, 400);
      assert.equal(error.code, "VALIDATION_ERROR");
      assert.equal(error.message, "Event date must be in the future");
      assert.deepEqual(error.details, [
        { field: "eventDate", message: "Event date must be in the future" },
      ]);
    }
  );
});

test("booking error messages are user-facing for common failures", () => {
  assert.match(
    messageForBookingError(
      new BookingApiError(
        "You already have an active request for this service on that date.",
        409,
        "DUPLICATE_BOOKING"
      )
    ),
    /already have an active request/i
  );
  assert.match(
    messageForBookingError(new Error("connection refused")),
    /couldn't submit/i
  );
});

test("network failures produce an actionable booking error", (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    throw new TypeError("Failed to fetch");
  }) as typeof fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  return createBookingRequest({
    serviceId: SERVICE_ID,
    eventDate: "2027-06-15",
    eventLocation: "Garden Banquet Hall",
    message: "",
  }).then(
    () => assert.fail("expected an error"),
    (error: unknown) => {
      assert.ok(error instanceof BookingApiError);
      assert.equal(error.code, "NETWORK_ERROR");
      assert.match(error.message, /couldn't reach the server/i);
    }
  );
});

test("booking form validation rejects missing, invalid, and past values", () => {
  const now = Date.parse("2026-11-21T10:00:00.000Z");
  const future = "2027-06-15";

  assert.equal(parseDateOnly("2026-02-30"), null);
  assert.ok(parseDateOnly(future) instanceof Date);

  const errors = validateBookingForm(
    { eventDate: "", eventLocation: "   ", message: "" },
    now
  );
  assert.equal(errors.eventDate, "Choose your event date.");
  assert.equal(errors.eventLocation, "Enter your event location.");

  assert.equal(
    validateBookingForm(
      { eventDate: "2026-11-21", eventLocation: "Hall", message: "" },
      now
    ).eventDate,
    "Choose a date in the future."
  );

  assert.deepEqual(
    validateBookingForm(
      { eventDate: future, eventLocation: " Hall ", message: "Note" },
      now
    ),
    {}
  );

  assert.equal(
    validateBookingForm(
      { eventDate: future, eventLocation: "x".repeat(151), message: "" },
      now
    ).eventLocation,
    "Keep the location under 150 characters."
  );
  assert.equal(
    validateBookingForm(
      { eventDate: future, eventLocation: "Hall", message: "x".repeat(1001) },
      now
    ).message,
    "Keep your message under 1000 characters."
  );
});

test("booking dates are formatted deterministically in UTC", () => {
  assert.equal(
    formatBookingDate("2027-06-15T00:00:00.000Z"),
    "Tuesday, June 15, 2027"
  );
  assert.equal(formatBookingDate("not-a-date"), "not-a-date");
});
