import { HOME_CATEGORIES } from "./home-categories.ts";
import {
  SERVICE_CATEGORIES,
  type PublicServiceSort,
  type ServiceBrowseParams,
  type ServiceCategory,
} from "./services-api.ts";

export const DEFAULT_BROWSE_SORT: PublicServiceSort = "recommended";

export const BROWSE_SORT_OPTIONS: readonly {
  value: PublicServiceSort;
  label: string;
}[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export interface BrowseCategoryOption {
  label: string;
  values: readonly ServiceCategory[];
}

export const BROWSE_CATEGORY_OPTIONS: readonly BrowseCategoryOption[] =
  HOME_CATEGORIES.map((category) => ({
    label: category.label,
    values: category.values,
  }));

export function normalizeCategoryParam(value: string | null): string {
  if (!value) return "";

  const requested = value
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean);

  if (!requested.length) return "";

  const valid = requested.filter((category) =>
    SERVICE_CATEGORIES.includes(category as ServiceCategory)
  );

  if (valid.length !== requested.length) return "";

  return Array.from(new Set(valid)).join(",");
}

export function readBrowseParams(
  searchParams: URLSearchParams
): ServiceBrowseParams {
  const rawSort = searchParams.get("sort");
  const sort = BROWSE_SORT_OPTIONS.some((option) => option.value === rawSort)
    ? (rawSort as PublicServiceSort)
    : DEFAULT_BROWSE_SORT;
  const rawPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const keyword =
    searchParams.get("q") ?? searchParams.get("search") ?? "";

  return {
    q: keyword.trim(),
    category: normalizeCategoryParam(searchParams.get("category")),
    location: (searchParams.get("location") ?? "").trim(),
    sort,
    page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
  };
}

export function writeBrowseParams(
  current: URLSearchParams,
  patch: Partial<ServiceBrowseParams>,
  resetPage = false
): URLSearchParams {
  const next = new URLSearchParams(current);

  function set(key: string, value: string) {
    if (value) next.set(key, value);
    else next.delete(key);
  }

  if (patch.q !== undefined) set("q", patch.q.trim());
  if (patch.category !== undefined) {
    set("category", normalizeCategoryParam(patch.category));
  }
  if (patch.location !== undefined) set("location", patch.location.trim());
  if (patch.sort !== undefined) {
    set("sort", patch.sort === DEFAULT_BROWSE_SORT ? "" : patch.sort);
  }
  if (patch.page !== undefined) set("page", patch.page === 1 ? "" : String(patch.page));

  if (resetPage || patch.q !== undefined || patch.category !== undefined || patch.location !== undefined || patch.sort !== undefined) {
    next.delete("page");
  }

  next.delete("search");
  return next;
}

export function isCategorySelected(
  selected: string,
  values: readonly ServiceCategory[]
): boolean {
  if (!selected) return false;
  const selectedValues = new Set(selected.split(","));
  return (
    selectedValues.size === values.length &&
    values.every((value) => selectedValues.has(value))
  );
}
