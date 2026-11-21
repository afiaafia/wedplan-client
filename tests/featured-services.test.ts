import test from "node:test";
import assert from "node:assert/strict";
import {
  FEATURED_SERVICES_LIMIT,
  FeaturedServicesApiError,
  featuredServiceHref,
  firstAvailableImage,
  getFeaturedServices,
  hasFeaturedServices,
  parseFeaturedServicesResponse,
  toFeaturedService,
} from "../src/lib/featured-services-api.ts";

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

function featuredBody(services: unknown[] = [sampleService()]) {
  return {
    success: true,
    data: { services, total: services.length },
    meta: { limit: FEATURED_SERVICES_LIMIT },
  };
}

function sampleService(overrides: Record<string, unknown> = {}) {
  return {
    id: "65b000000000000000000001",
    title: "Garden Photographer",
    category: "Photography",
    description: "Full-day wedding coverage",
    location: "Lagos",
    price: 450000,
    images: ["https://images.unsplash.com/photo-1"],
    isActive: true,
    approvalStatus: "approved",
    createdAt: "2026-01-01T00:00:00.000Z",
    vendor: {
      id: "65a000000000000000000001",
      name: "Ada Events",
      profileImage: "https://example.com/ada.jpg",
      businessName: "Ada Weddings",
    },
    ...overrides,
  };
}

test("featured endpoint is fetched from the server API with a validated limit", async (t) => {
  const previous = process.env.API_INTERNAL_URL;
  process.env.API_INTERNAL_URL = "https://api.example.com/";
  t.after(() => {
    if (previous === undefined) delete process.env.API_INTERNAL_URL;
    else process.env.API_INTERNAL_URL = previous;
  });

  const requests: RequestRecord[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = stubFetch(200, featuredBody(), requests);
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const result = await getFeaturedServices();

  assert.equal(
    requests[0]?.url,
    "https://api.example.com/api/services/featured?limit=6"
  );
  assert.equal(requests[0]?.init?.cache, "no-store");
  assert.equal(result.success, true);
  assert.equal(result.data.total, 1);
  assert.equal(hasFeaturedServices(result), true);
});

test("API response parsing maps service and vendor fields for cards", () => {
  const result = parseFeaturedServicesResponse(featuredBody());
  const service = result.data.services[0];

  assert.deepEqual(service, {
    id: "65b000000000000000000001",
    title: "Garden Photographer",
    category: "Photography",
    description: "Full-day wedding coverage",
    location: "Lagos",
    price: 450000,
    images: ["https://images.unsplash.com/photo-1"],
    isActive: true,
    approvalStatus: "approved",
    createdAt: "2026-01-01T00:00:00.000Z",
    vendor: {
      id: "65a000000000000000000001",
      name: "Ada Events",
      profileImage: "https://example.com/ada.jpg",
      businessName: "Ada Weddings",
    },
  });
});

test("missing vendor information is preserved as null and private fields are ignored", () => {
  const parsed = parseFeaturedServicesResponse(
    featuredBody([
      sampleService({
        vendor: {
          id: "65a000000000000000000001",
          email: "private@example.com",
          passwordHash: "secret",
          stripeSubscriptionId: "sub_secret",
        },
      }),
      sampleService({ id: "65b000000000000000000002", vendor: null }),
    ])
  );

  assert.equal(parsed.data.total, 2);
  assert.deepEqual(parsed.data.services[0]?.vendor, {
    id: "65a000000000000000000001",
  });
  assert.equal(parsed.data.services[1]?.vendor, null);
  assert.equal(JSON.stringify(parsed).includes("passwordHash"), false);
});

test("malformed, pending, and inactive records are not rendered", () => {
  assert.equal(toFeaturedService(null), null);
  assert.equal(
    toFeaturedService(sampleService({ approvalStatus: "pending" })),
    null
  );
  assert.equal(toFeaturedService(sampleService({ isActive: false })), null);

  assert.throws(
    () => parseFeaturedServicesResponse({ success: true, data: null }),
    FeaturedServicesApiError
  );
  assert.throws(
    () => parseFeaturedServicesResponse({ success: false, data: {} }),
    FeaturedServicesApiError
  );
});

test("empty results keep a valid empty response for the empty state", () => {
  const result = parseFeaturedServicesResponse(featuredBody([]));

  assert.deepEqual(result.data, { services: [], total: 0 });
  assert.equal(hasFeaturedServices(result), false);
});

test("network, HTTP, and invalid response failures throw user-facing errors", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = (async () => {
    throw new Error("offline");
  }) as typeof fetch;
  await assert.rejects(getFeaturedServices(), (error: unknown) => {
    assert.ok(error instanceof FeaturedServicesApiError);
    assert.equal(error.message, "Unable to reach the services API.");
    return true;
  });

  globalThis.fetch = stubFetch(503, {
    success: false,
    error: { message: "Temporarily unavailable" },
  }, []);
  await assert.rejects(getFeaturedServices(), (error: unknown) => {
    assert.ok(error instanceof FeaturedServicesApiError);
    assert.equal(error.message, "Temporarily unavailable");
    assert.equal(error.status, 503);
    return true;
  });

  globalThis.fetch = stubFetch(
    200,
    "not-json",
    [],
    true
  );
  await assert.rejects(getFeaturedServices(), (error: unknown) => {
    assert.ok(error instanceof FeaturedServicesApiError);
    assert.equal(error.message, "The server returned an invalid response.");
    return true;
  });
});

test("a broken cover image falls back to the next stored image URL", () => {
  const images = [
    "https://images.example.com/broken.jpg",
    "",
    "https://images.example.com/valid.jpg",
  ];

  assert.equal(firstAvailableImage(images), images[0]);
  assert.equal(firstAvailableImage(images, [images[0]]), images[2]);
  assert.equal(firstAvailableImage(images, [images[0], images[2]]), undefined);
});

test("service cards link to the existing service details route", () => {
  assert.equal(
    featuredServiceHref("65b000000000000000000001"),
    "/services/65b000000000000000000001"
  );
  assert.equal(featuredServiceHref("a/b"), "/services/a%2Fb");
});
