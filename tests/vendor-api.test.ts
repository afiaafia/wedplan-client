import test from "node:test";
import assert from "node:assert/strict";
import {
  createVendorApiError,
  createVendorService,
  getVendorDashboard,
  getVendorServices,
  messageForVendorApiError,
  normalizeVendorApiCode,
  parseVendorDashboardResponse,
  parseVendorServiceResponse,
  parseVendorServicesResponse,
  setVendorServiceActive,
  toCreateServiceInput,
  toUpdateServiceInput,
  updateVendorService,
  validateServiceForm,
  VendorApiError,
  type ServiceFormValues,
} from "../src/lib/vendor-api.ts";
import {
  formatServiceUsage,
  FREE_PLAN_LIMIT_MESSAGE,
  isActiveServiceLimitReached,
} from "../src/lib/subscription.ts";
import {
  EMPTY_VENDOR_OVERVIEW,
  getVendorDataState,
  resolveBookingServiceName,
  type VendorService,
} from "../src/lib/vendor-dashboard.ts";

const service: VendorService = {
  id: "65b000000000000000000001",
  title: "Garden photography",
  category: "Photography",
  description: "Full-day wedding coverage",
  location: "Lagos",
  price: 1250,
  images: ["https://example.com/photo.jpg"],
  approvalStatus: "approved",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

const inactiveService: VendorService = {
  ...service,
  id: "65b000000000000000000002",
  title: "Reception decor",
  category: "Decoration",
  isActive: false,
};

const booking = {
  id: "65c000000000000000000001",
  serviceId: service.id,
  customerId: "65d000000000000000000001",
  eventDate: "2026-06-18T00:00:00.000Z",
  eventLocation: "Lagos",
  message: "Please call before the event",
  status: "Pending",
  createdAt: "2026-02-01T00:00:00.000Z",
};

const dashboardBody = {
  success: true,
  data: {
    stats: {
      totalServices: 2,
      activeServices: 1,
      pendingApproval: 0,
      totalBookings: 3,
    },
    services: [service, inactiveService],
    bookings: [booking],
  },
};

const validValues: ServiceFormValues = {
  title: "Wedding videography",
  category: "Videography",
  description: "Cinematic highlights and full ceremony film",
  location: "Abuja",
  price: "850",
  images: "https://example.com/one.jpg\nhttps://example.com/two.jpg",
  isActive: false,
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

test("dashboard statistics and records are parsed from the API response", () => {
  const overview = parseVendorDashboardResponse(dashboardBody);

  assert.deepEqual(overview.stats, {
    totalServices: 2,
    activeServices: 1,
    pendingApproval: 0,
    totalBookings: 3,
  });
  assert.equal(overview.services[0]?.title, "Garden photography");
  assert.equal(overview.services[0]?.description, "Full-day wedding coverage");
  assert.equal(overview.bookings[0]?.id, booking.id);
  assert.equal(
    resolveBookingServiceName(booking.serviceId, overview.services),
    "Garden photography"
  );
});

test("loading, empty, error, and ready dashboard states are derived from real data", () => {
  assert.equal(getVendorDataState(EMPTY_VENDOR_OVERVIEW, null), "loading");
  assert.equal(
    getVendorDataState(EMPTY_VENDOR_OVERVIEW, "Network error"),
    "error"
  );

  const empty = parseVendorDashboardResponse({
    success: true,
    data: {
      stats: {
        totalServices: 0,
        activeServices: 0,
        pendingApproval: 0,
        totalBookings: 0,
      },
      services: [],
      bookings: [],
    },
  });
  assert.equal(getVendorDataState(empty, null), "empty");

  const ready = parseVendorDashboardResponse(dashboardBody);
  assert.equal(getVendorDataState(ready, null), "ready");
  assert.equal(
    resolveBookingServiceName("missing-service", ready.services),
    "Service listing unavailable"
  );
});

test("malformed dashboard responses are surfaced instead of faked", () => {
  assert.throws(
    () =>
      parseVendorDashboardResponse({
        success: true,
        data: { ...dashboardBody.data, stats: { totalServices: 1 } },
      }),
    (error: unknown) =>
      error instanceof VendorApiError && error.code === "UNEXPECTED_RESPONSE"
  );
});

test("dashboard fetch sends the session cookie credentials and no hardcoded stats", (t) => {
  const requests = stubFetch(t, () => ({ status: 200, body: dashboardBody }));

  return getVendorDashboard().then((overview) => {
    assert.equal(requests[0]?.url, "http://localhost:5000/api/vendor/dashboard");
    assert.equal(requests[0]?.init?.credentials, "include");
    assert.equal(requests[0]?.init?.cache, "no-store");
    assert.equal(overview.stats.activeServices, 1);
    assert.equal(overview.stats.totalBookings, 3);
  });
});

test("vendor services are loaded from the vendor-scoped endpoint", (t) => {
  const requests = stubFetch(t, () => ({
    status: 200,
    body: { success: true, data: [service, inactiveService] },
  }));

  return getVendorServices().then((services) => {
    assert.equal(requests[0]?.url, "http://localhost:5000/api/vendor/services");
    assert.equal(requests[0]?.init?.credentials, "include");
    assert.deepEqual(
      services.map((item) => item.title),
      ["Garden photography", "Reception decor"]
    );
  });
});

test("service list responses require the backend envelope", () => {
  assert.throws(
    () => parseVendorServicesResponse({ data: [service] }),
    (error: unknown) =>
      error instanceof VendorApiError && error.code === "UNEXPECTED_RESPONSE"
  );
});

test("service creation sends only fields accepted by the backend", (t) => {
  const requests = stubFetch(t, () => ({
    status: 201,
    body: { success: true, data: { ...service, isActive: true } },
  }));
  const input = toCreateServiceInput({ ...validValues, isActive: true });

  return createVendorService(input).then((created) => {
    assert.equal(created.isActive, true);
    assert.equal(requests[0]?.init?.method, "POST");
    assert.equal(requests[0]?.init?.credentials, "include");
    assert.deepEqual(JSON.parse(String(requests[0]?.init?.body)), {
      title: "Wedding videography",
      category: "Videography",
      description: "Cinematic highlights and full ceremony film",
      location: "Abuja",
      price: 850,
      images: [
        "https://example.com/one.jpg",
        "https://example.com/two.jpg",
      ],
      isActive: true,
    });
  });
});

test("service editing uses PATCH and never sends activation or vendor ids", (t) => {
  const requests = stubFetch(t, () => ({
    status: 200,
    body: { success: true, data: service },
  }));

  return updateVendorService(service.id, toUpdateServiceInput(validValues)).then(
    () => {
      assert.equal(
        requests[0]?.url,
        `http://localhost:5000/api/vendor/services/${service.id}`
      );
      assert.equal(requests[0]?.init?.method, "PATCH");
      const body = JSON.parse(String(requests[0]?.init?.body)) as Record<
        string,
        unknown
      >;
      assert.deepEqual(Object.keys(body).sort(), [
        "category",
        "description",
        "images",
        "location",
        "price",
        "title",
      ]);
    }
  );
});

test("activation and deactivation use the dedicated active endpoint", (t) => {
  const requests = stubFetch(t, (request) => ({
    status: 200,
    body: {
      success: true,
      data: {
        ...service,
        isActive: request.url.endsWith("/active"),
      },
    },
  }));

  return setVendorServiceActive(service.id, true)
    .then(() => setVendorServiceActive(service.id, false))
    .then(() => {
      assert.equal(
        requests[0]?.url,
        `http://localhost:5000/api/vendor/services/${service.id}/active`
      );
      assert.equal(requests[0]?.init?.method, "PATCH");
      assert.deepEqual(JSON.parse(String(requests[0]?.init?.body)), {
        isActive: true,
      });
      assert.deepEqual(JSON.parse(String(requests[1]?.init?.body)), {
        isActive: false,
      });
    });
});

test("FREE_PLAN_LIMIT_REACHED produces actionable guidance", (t) => {
  stubFetch(t, () => ({
    status: 403,
    body: {
      success: false,
      error: {
        code: "FREE_PLAN_LIMIT_REACHED",
        message:
          "Free plan supports at most 3 active services. Upgrade to Premium or deactivate a service to continue.",
        details: { plan: "free", activeServices: 3, limit: 3 },
      },
    },
  }));

  return setVendorServiceActive(inactiveService.id, true).then(
    () => assert.fail("activation should have been rejected"),
    (error: unknown) => {
      assert.ok(error instanceof VendorApiError);
      assert.equal(error.status, 403);
      assert.equal(error.code, "FREE_PLAN_LIMIT_REACHED");
      assert.match(messageForVendorApiError(error), /deactivate/i);
      assert.match(messageForVendorApiError(error), /Premium/i);
    }
  );
});

test("unauthorized and forbidden responses are mapped for the UI", (t) => {
  stubFetch(t, (request) => ({
    status: request.url.endsWith("/dashboard") ? 401 : 403,
    body: {
      success: false,
      error: {
        code: request.url.endsWith("/dashboard")
          ? "UNAUTHORIZED"
          : "VENDOR_ACCESS_REQUIRED",
        message: "Backend error",
      },
    },
  }));

  return getVendorDashboard()
    .then(
      () => assert.fail("dashboard should have been rejected"),
      (error: unknown) => {
        assert.ok(error instanceof VendorApiError);
        assert.equal(error.code, "UNAUTHORIZED");
        assert.match(messageForVendorApiError(error), /sign in again/i);
      }
    )
    .then(() => getVendorServices())
    .then(
      () => assert.fail("services should have been rejected"),
      (error: unknown) => {
        assert.ok(error instanceof VendorApiError);
        assert.equal(error.code, "VENDOR_ACCESS_REQUIRED");
        assert.match(messageForVendorApiError(error), /vendor accounts/i);
      }
    );
});

test("validation details from the backend are shown to the user", () => {
  const error = createVendorApiError(
    {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request parameters",
        details: [{ field: "price", message: "must be <= 1000000" }],
      },
    },
    400,
    "Unable to save"
  );

  assert.equal(error.code, "VALIDATION_ERROR");
  assert.equal(
    messageForVendorApiError(error),
    "Check the following: price must be <= 1000000."
  );
  assert.equal(normalizeVendorApiCode("UNKNOWN_CODE", 500), "INTERNAL_ERROR");
  assert.equal(normalizeVendorApiCode(undefined, 403), "FORBIDDEN");
  assert.equal(normalizeVendorApiCode("NOT_FOUND", 404), "UNKNOWN");
  assert.equal(normalizeVendorApiCode("SERVICE_NOT_FOUND", 404), "SERVICE_NOT_FOUND");
});

test("created and updated service responses use the backend envelope", () => {
  assert.deepEqual(parseVendorServiceResponse({ success: true, data: service }), service);
  assert.throws(
    () => parseVendorServiceResponse({ success: false, data: service }),
    (error: unknown) =>
      error instanceof VendorApiError && error.code === "UNEXPECTED_RESPONSE"
  );
});

test("service form validation matches backend field rules", () => {
  assert.deepEqual(validateServiceForm(validValues), {});
  assert.equal(
    validateServiceForm({ ...validValues, title: "   " }).title,
    "Enter a service title."
  );
  assert.equal(
    validateServiceForm({ ...validValues, category: "Unknown" }).category,
    "Choose a valid category."
  );
  assert.equal(
    validateServiceForm({ ...validValues, price: "-1" }).price,
    "Price must be between 0 and 1,000,000."
  );
  assert.equal(
    validateServiceForm({ ...validValues, description: "" }).description,
    "Enter a description."
  );
  assert.equal(
    validateServiceForm({
      ...validValues,
      images: Array.from({ length: 11 }, (_, index) => `url-${index}`).join(
        "\n"
      ),
    }).images,
    "Add up to 10 image URLs."
  );
});

test("free usage is shown as X / 3 while premium has no limit", () => {
  assert.equal(
    formatServiceUsage(2, "free"),
    "2 / 3 active services used · 1 remaining"
  );
  assert.equal(isActiveServiceLimitReached(2, "free"), false);
  assert.equal(isActiveServiceLimitReached(3, "free"), true);
  assert.equal(isActiveServiceLimitReached(7, "premium"), false);
  assert.equal(isActiveServiceLimitReached(null, "free"), false);
  assert.equal(formatServiceUsage(7, "premium"), "7 active services");
});

test("free limit guidance explains deactivation and upgrade options", () => {
  assert.match(FREE_PLAN_LIMIT_MESSAGE, /deactivate a service/i);
  assert.match(FREE_PLAN_LIMIT_MESSAGE, /upgrade to Premium/i);
});

test("premium vendors can activate without a client-side cap", (t) => {
  const requests = stubFetch(t, () => ({
    status: 200,
    body: { success: true, data: service },
  }));

  assert.equal(isActiveServiceLimitReached(7, "premium"), false);

  return createVendorService(toCreateServiceInput({ ...validValues, isActive: true }))
    .then((created) => {
      assert.equal(created.isActive, true);
      assert.equal(requests.length, 1);
      assert.equal(requests[0]?.init?.method, "POST");
    });
});

test("deactivation after a downgrade is not blocked or automated by the client", (t) => {
  stubFetch(t, () => ({
    status: 200,
    body: { success: true, data: { ...service, isActive: true } },
  }));

  return setVendorServiceActive(service.id, false).then(() => {
    assert.equal(isActiveServiceLimitReached(4, "free"), true);
  });
});
