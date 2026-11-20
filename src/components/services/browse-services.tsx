"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  RotateCcw,
  Search,
  SearchX,
  SlidersHorizontal,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import ServiceCard from "./service-card";
import ServicesSkeleton from "./services-skeleton";
import {
  ApiError,
  buildServicesQuery,
  getPublicServices,
  SERVICE_CATEGORIES,
  type PublicServiceSort,
  type ServiceBrowseParams,
  type ServicesResponse,
} from "@/lib/services-api";

const SORT_OPTIONS: { value: PublicServiceSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

const categoryValues = SERVICE_CATEGORIES as readonly string[];

function writeParam(searchParams: URLSearchParams, key: string, value: string) {
  if (value) {
    searchParams.set(key, value);
  } else {
    searchParams.delete(key);
  }
}

function readParams(searchParams: ReturnType<typeof useSearchParams>): ServiceBrowseParams {
  const rawSort = searchParams.get("sort");
  const sort = SORT_OPTIONS.some((option) => option.value === rawSort)
    ? (rawSort as PublicServiceSort)
    : "newest";
  const rawCategory = searchParams.get("category") ?? "";
  const rawPage = Number.parseInt(searchParams.get("page") ?? "1", 10);

  return {
    q: searchParams.get("q")?.trim() ?? "",
    category: categoryValues.includes(rawCategory) ? rawCategory : "",
    location: searchParams.get("location")?.trim() ?? "",
    sort,
    page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
  };
}

export default function BrowseServices() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();

  const params = useMemo(
    () => readParams(searchParams),
    [searchParams]
  );

  const [textFilters, setTextFilters] = useState({
    q: params.q,
    location: params.location,
    committedQ: params.q,
    committedLocation: params.location,
  });
  const [fetchState, setFetchState] = useState<{
    key: string;
    data: ServicesResponse | null;
    error: string | null;
  }>({ key: "", data: null, error: null });
  const [retryCount, setRetryCount] = useState(0);
  const requestId = useRef(0);

  if (
    textFilters.committedQ !== params.q ||
    textFilters.committedLocation !== params.location
  ) {
    setTextFilters({
      q: params.q,
      location: params.location,
      committedQ: params.q,
      committedLocation: params.location,
    });
  }

  const updateParams = useCallback(
    (patch: Partial<ServiceBrowseParams>, resetPage = false) => {
      const next = new URLSearchParams(searchParams.toString());

      if (patch.q !== undefined) writeParam(next, "q", patch.q.trim());
      if (patch.category !== undefined) {
        writeParam(next, "category", patch.category);
      }
      if (patch.location !== undefined) {
        writeParam(next, "location", patch.location.trim());
      }
      if (patch.sort !== undefined) {
        writeParam(next, "sort", patch.sort === "newest" ? "" : patch.sort);
      }
      if (patch.page !== undefined) {
        writeParam(next, "page", patch.page === 1 ? "" : String(patch.page));
      }
      if (resetPage) next.delete("page");

      const nextQuery = next.toString();
      if (nextQuery === searchParams.toString()) return;

      router.replace(
        nextQuery ? `${pathname}?${nextQuery}` : pathname,
        { scroll: false }
      );
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    if (
      textFilters.q === params.q &&
      textFilters.location === params.location
    ) {
      return;
    }

    const timer = setTimeout(() => {
      updateParams(
        { q: textFilters.q, location: textFilters.location },
        true
      );
    }, 350);

    return () => clearTimeout(timer);
  }, [
    textFilters.q,
    textFilters.location,
    params.q,
    params.location,
    updateParams,
  ]);

  const query = useMemo(
    () =>
      buildServicesQuery({
        q: params.q,
        category: params.category,
        location: params.location,
        sort: params.sort,
        page: params.page,
      }),
    [params.q, params.category, params.location, params.sort, params.page]
  );

  const requestKey = `${query}|${retryCount}`;
  const isLoading = fetchState.key !== requestKey;
  const result = fetchState.data;
  const errorMessage = fetchState.error ?? "";
  const status = isLoading
    ? "loading"
    : errorMessage
      ? "error"
      : "success";

  useEffect(() => {
    const currentRequest = ++requestId.current;
    const controller = new AbortController();

    getPublicServices(query, controller.signal)
      .then((data) => {
        if (currentRequest !== requestId.current) return;
        setFetchState({ key: requestKey, data, error: null });
      })
      .catch((error: unknown) => {
        if (currentRequest !== requestId.current || controller.signal.aborted) {
          return;
        }
        setFetchState({
          key: requestKey,
          data: null,
          error:
            error instanceof ApiError
              ? error.message
              : "Something went wrong while loading services.",
        });
      });

    return () => controller.abort();
  }, [query, requestKey]);

  const hasFilters = Boolean(
    params.q || params.category || params.location || params.sort !== "newest"
  );

  function clearAll() {
    setTextFilters((current) => ({ ...current, q: "", location: "" }));
    router.replace(pathname, { scroll: false });
  }

  const fieldClass =
    "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted/70 transition-colors hover:border-accent focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  return (
    <>
      <section
        aria-label="Service filters"
        className="rounded-2xl border border-border/80 bg-card/70 p-5 shadow-sm backdrop-blur-sm sm:p-6"
      >
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal size={17} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Find your perfect match
          </h2>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2 xl:col-span-1">
            <label htmlFor="service-search" className="sr-only">
              Search services by keyword
            </label>
            <div className="relative">
              <Search
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="service-search"
                type="search"
                value={textFilters.q}
                onChange={(event) =>
                  setTextFilters((current) => ({
                    ...current,
                    q: event.target.value,
                  }))
                }
                placeholder="Search services..."
                className={`${fieldClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="service-category" className="sr-only">
              Filter by category
            </label>
            <select
              id="service-category"
              value={params.category}
              onChange={(event) =>
                updateParams({ category: event.target.value }, true)
              }
              className={fieldClass}
            >
              <option value="">All categories</option>
              {SERVICE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="service-location" className="sr-only">
              Filter by location
            </label>
            <input
              id="service-location"
              type="search"
              value={textFilters.location}
              onChange={(event) =>
                setTextFilters((current) => ({
                  ...current,
                  location: event.target.value,
                }))
              }
              placeholder="Location, e.g. Lagos"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="service-sort" className="sr-only">
              Sort services
            </label>
            <select
              id="service-sort"
              value={params.sort}
              onChange={(event) =>
                updateParams(
                  { sort: event.target.value as PublicServiceSort },
                  true
                )
              }
              className={fieldClass}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <RotateCcw size={13} />
            Clear all filters
          </button>
        )}
      </section>

      {status === "loading" && <div className="mt-8"><ServicesSkeleton /></div>}

      {status === "error" && (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-error/30 bg-card p-10 text-center"
        >
          <AlertCircle size={28} className="mx-auto text-error" />
          <h2 className="mt-4 font-serif text-xl text-foreground">
            We couldn&apos;t load services
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <RotateCcw size={15} />
            Try again
          </button>
        </div>
      )}

      {status === "success" && result && (
        <>
          <div className="mt-9 flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm text-muted">
              {result.meta.total} {result.meta.total === 1 ? "service" : "services"} found
            </p>
            {result.meta.total > 0 && (
              <p className="text-xs text-muted">
                Page {result.meta.page} of {result.meta.totalPages}
              </p>
            )}
          </div>

          {result.data.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-border/80 bg-card/70 px-6 py-16 text-center">
              <SearchX size={30} className="mx-auto text-accent" />
              <h2 className="mt-5 font-serif text-2xl text-foreground">
                No services found
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                {hasFilters
                  ? "Try a different keyword or remove some filters to see more services."
                  : "There are no approved services available just yet. Please check back soon."}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <RotateCcw size={14} />
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <motion.div
              className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {result.data.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.28,
                    delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.18),
                  }}
                >
                  <ServiceCard service={service} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {result.meta.totalPages > 1 && (
            <nav
              aria-label="Services pagination"
              className="mt-10 flex items-center justify-center gap-3"
            >
              <button
                type="button"
                disabled={!result.meta.hasPreviousPage}
                onClick={() => updateParams({ page: params.page - 1 })}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Previous
              </button>
              <span
                aria-current="page"
                className="px-2 text-sm text-muted"
              >
                {result.meta.page} / {result.meta.totalPages}
              </span>
              <button
                type="button"
                disabled={!result.meta.hasNextPage}
                onClick={() => updateParams({ page: params.page + 1 })}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
