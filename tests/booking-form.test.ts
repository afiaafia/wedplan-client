import test from "node:test";
import assert from "node:assert/strict";
import {
  futureDateString,
  parseDateOnly,
  validateBookingForm,
  type BookingFormValues,
} from "../src/lib/booking-form.ts";

const NOW = Date.UTC(2026, 0, 15, 9, 30, 0);
const FUTURE = "2026-01-20";
const PAST = "2026-01-01";

function values(overrides: Partial<BookingFormValues> = {}): BookingFormValues {
  return {
    eventDate: FUTURE,
    eventLocation: "  Garden Banquet Hall  ",
    message: "  Evening reception  ",
    ...overrides,
  };
}

test("future date helper always returns a date the validator accepts", () => {
  for (const now of [
    NOW,
    Date.UTC(2026, 0, 15, 23, 59, 0),
    Date.UTC(2026, 0, 1, 0, 1, 0),
  ]) {
    const date = futureDateString(now);
    const parsed = parseDateOnly(date);

    assert.ok(parsed, date);
    assert.ok(parsed.getTime() > now, date);
    assert.deepEqual(validateBookingForm(values({ eventDate: date }), now), {});
  }
});

test("valid booking values produce no field errors", () => {
  assert.deepEqual(validateBookingForm(values(), NOW), {});
});

test("event date is required, well formed, and in the future", () => {
  const cases = ["", "not-a-date", "2026-02-30", PAST, "2026-01-15"];

  for (const eventDate of cases) {
    const errors = validateBookingForm(values({ eventDate }), NOW);
    assert.ok(errors.eventDate, eventDate);
  }
});

test("event location is trimmed and length limited", () => {
  assert.deepEqual(validateBookingForm(values({ eventLocation: "   " }), NOW), {
    eventLocation: "Enter your event location.",
  });
  assert.ok(
    validateBookingForm(values({ eventLocation: "x".repeat(151) }), NOW)
      .eventLocation
  );
  assert.deepEqual(
    validateBookingForm(values({ eventLocation: `  ${"x".repeat(150)}  ` }), NOW),
    {}
  );
});

test("additional message is optional but length limited", () => {
  assert.deepEqual(validateBookingForm(values({ message: "" }), NOW), {});
  assert.deepEqual(
    validateBookingForm(values({ message: " ".repeat(1001) }), NOW),
    {}
  );
  assert.ok(
    validateBookingForm(values({ message: "x".repeat(1001) }), NOW).message
  );
});

test("invalid calendar dates are rejected", () => {
  assert.equal(parseDateOnly("2026-02-30"), null);
  assert.equal(parseDateOnly("01/20/2026"), null);
  assert.ok(parseDateOnly(FUTURE));
});
