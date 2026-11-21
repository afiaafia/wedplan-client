import test from "node:test";
import assert from "node:assert/strict";
import {
  BROWSE_CATEGORY_OPTIONS,
  BROWSE_SORT_OPTIONS,
  isCategorySelected,
  normalizeCategoryParam,
  readBrowseParams,
  writeBrowseParams,
} from "../src/lib/services-filters.ts";
import { buildServicesQuery } from "../src/lib/services-api.ts";
import { HOME_CATEGORIES, homeCategoryHref } from "../src/lib/home-categories.ts";

test("browse categories use the six required marketplace labels", () => {
  assert.deepEqual(
    BROWSE_CATEGORY_OPTIONS.map((option) => option.label),
    [
      "Photography & Videography",
      "Wedding Venues",
      "Decoration & Florist",
      "Catering Services",
      "Makeup & Styling",
      "Wedding Fashion",
    ]
  );
  assert.deepEqual(BROWSE_CATEGORY_OPTIONS[0]?.values, [
    "Photography",
    "Videography",
  ]);
});

test("sort options expose recommended and numeric price ordering", () => {
  assert.deepEqual(
    BROWSE_SORT_OPTIONS.map((option) => option.value),
    ["recommended", "price_asc", "price_desc"]
  );
});

test("reading params trims text and ignores invalid values", () => {
  const params = new URLSearchParams(
    "q=%20%20Photographer%20%20&location=%20Dhaka%20&category=Photography%2CVideography&sort=price_desc&page=3"
  );
  assert.deepEqual(readBrowseParams(params), {
    q: "Photographer",
    location: "Dhaka",
    category: "Photography,Videography",
    sort: "price_desc",
    page: 3,
  });

  assert.deepEqual(
    readBrowseParams(
      new URLSearchParams("q=x&category=NotReal&sort=random&page=-2")
    ),
    { q: "x", location: "", category: "", sort: "recommended", page: 1 }
  );
});

test("legacy search and q aliases are both accepted on refresh", () => {
  assert.equal(
    readBrowseParams(new URLSearchParams("search=Vendor")).q,
    "Vendor"
  );
  assert.equal(readBrowseParams(new URLSearchParams("q=Vendor")).q, "Vendor");
});

test("invalid category values never reach the API query", () => {
  assert.equal(normalizeCategoryParam("Photography,Bogus"), "");
  assert.equal(normalizeCategoryParam(""), "");
  assert.equal(
    normalizeCategoryParam("Videography,Photography"),
    "Videography,Photography"
  );
});

test("writing params resets pagination and removes default values", () => {
  const current = new URLSearchParams(
    "q=photo&category=Photography&location=Dhaka&sort=price_asc&page=4"
  );
  const next = writeBrowseParams(current, { category: "Catering" });

  assert.equal(next.get("page"), null);
  assert.equal(next.get("category"), "Catering");
  assert.equal(next.get("q"), "photo");
  assert.equal(next.get("sort"), "price_asc");

  const defaultSort = writeBrowseParams(new URLSearchParams(), {
    sort: "recommended",
  });
  assert.equal(defaultSort.get("sort"), null);

  const paged = writeBrowseParams(new URLSearchParams("q=photo"), {
    page: 2,
  });
  assert.equal(paged.get("page"), "2");
});

test("category chip state matches multi-value backend filters", () => {
  assert.equal(isCategorySelected("Photography,Videography", ["Photography", "Videography"]), true);
  assert.equal(isCategorySelected("Photography", ["Photography", "Videography"]), false);
  assert.equal(isCategorySelected("", ["Photography"]), false);
});

test("homepage category links select the correct backend values", () => {
  const photography = HOME_CATEGORIES[0];
  assert.ok(photography);
  assert.equal(
    homeCategoryHref(photography),
    "/services?category=Photography%2CVideography"
  );
  assert.equal(
    readBrowseParams(new URLSearchParams(homeCategoryHref(photography).split("?")[1] ?? ""))
      .category,
    "Photography,Videography"
  );
});

test("API query includes trimmed filters and server-side sorting", () => {
  const query = buildServicesQuery({
    q: "  photo ",
    category: "Photography,Videography",
    location: " Dhaka ",
    sort: "price_asc",
    page: 2,
  });
  const params = new URLSearchParams(query);

  assert.equal(params.get("q"), "photo");
  assert.equal(params.get("category"), "Photography,Videography");
  assert.equal(params.get("location"), "Dhaka");
  assert.equal(params.get("sort"), "price_asc");
  assert.equal(params.get("page"), "2");
});
