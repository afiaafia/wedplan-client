"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SearchX,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import ServiceCard from "./service-card";
import ServicesPageHeader from "./services-page-header";
import ServicesSkeleton from "./services-skeleton";
import {
  ApiError,
  buildServicesQuery,
  getPublicServices,
  type ServicesResponse,
} from "@/lib/services-api";
import {
  BROWSE_CATEGORY_OPTIONS,
  BROWSE_SORT_OPTIONS,
  DEFAULT_BROWSE_SORT,
  isCategorySelected,
  readBrowseParams,
  writeBrowseParams,
} from "@/lib/services-filters";

const SEARCH_DEBOUNCE_MS = 350;

interface FetchState {
  key: string;
  data: ServicesResponse | null;
  error: string | null;
}

export default function BrowseServices() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();

  const params = useMemo(
    () => readBrowseParams(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );

  const [textFilters, setTextFilters] = useState({
    q: params.q,
    location: params.location,
    committedQ: params.q,
    committedLocation: params.location,
  });
  const queryInput = textFilters.q;
  const locationInput = textFilters.location;
  const [fetchState, setFetchState] = useState<FetchState>({
    key: "",
    data: null,
    error: null,
  });
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
    (patch: Parameters<typeof writeBrowseParams>[1], resetPage = false) => {
      const next = writeBrowseParams(
        new URLSearchParams(searchParams.toString()),
        patch,
        resetPage
      );
      const nextQuery = next.toString();
      if (nextQuery === searchParams.toString()) return;

      router.replace(nextQuery ? `/services?${nextQuery}` : "/services", {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (queryInput === params.q && locationInput === params.location) return;

    const timer = setTimeout(() => {
      updateParams({ q: queryInput, location: locationInput }, true);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [queryInput, locationInput, params.q, params.location, updateParams]);

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
  const errorMessage = fetchState.error;
  const hasFilters = Boolean(
    params.q || params.category || params.location || params.sort !== DEFAULT_BROWSE_SORT
  );
  const count = result?.meta.total ?? 0;

  useEffect(() => {
    const currentRequest = ++requestId.current;
    const controller = new AbortController();

    getPublicServices(query, controller.signal)
      .then((data) => {
        if (currentRequest !== requestId.current) return;
        setFetchState({ key: requestKey, data, error: null });
      })
      .catch((error: unknown) => {
        if (currentRequest !== requestId.current || controller.signal.aborted) return;
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

  function clearAll() {
    setTextFilters((current) => ({
      ...current,
      q: "",
      location: "",
    }));
    router.replace("/services", { scroll: false });
  }

  const fieldClass =
    "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted/70 transition-colors hover:border-accent focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  return (
    <>
      <ServicesPageHeader
        query={queryInput}
        onQueryChange={(value) =>
          setTextFilters((current) => ({ ...current, q: value }))
        }
        onSearch={() => updateParams({ q: queryInput }, true)}
        count={count}
        isLoading={isLoading}
      />

      <section
        aria-label="Service filters"
        className="mt-8 rounded-2xl border border-border/80 bg-card/70 p-5 shadow-sm backdrop-blur-sm sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={17} className="text-primary" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-foreground">
              Find your perfect match
            </h2>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <RotateCcw size={13} aria-hidden="true" />
              Clear all filters
            </button>
          )}
        </div>

        <div className="mt-5 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0">
          <button
            type="button"
            aria-pressed={!params.category}
            onClick={() => updateParams({ category: "" }, true)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              !params.category
                ? "border-primary bg-primary text-white"
                : "border-border bg-background text-muted hover:border-primary hover:text-primary"
            }`}
          >
            All Categories
          </button>
          {BROWSE_CATEGORY_OPTIONS.map((option) => {
            const value = option.values.join(",");
            const active = isCategorySelected(params.category, option.values);
            return (
              <button
                key={option.label}
                type="button"
                aria-pressed={active}
                onClick={() => updateParams({ category: value }, true)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-muted hover:border-primary hover:text-primary"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          <div>
            <label htmlFor="service-location" className="sr-only">
              Filter by location
            </label>
            <div className="relative">
              <input
                id="service-location"
                type="search"
                value={locationInput}
                onChange={(event) =>
                  setTextFilters((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                placeholder="Location, e.g. Dhaka"
                className={`${fieldClass} pr-10`}
              />
              {locationInput && (
                <button
                  type="button"
                  onClick={() => {
                    setTextFilters((current) => ({ ...current, location: "" }));
                    updateParams({ location: "" }, true);
                  }}
                  aria-label="Clear location filter"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted transition-colors hover:bg-secondary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="service-sort" className="sr-only">
              Sort services
            </label>
            <select
              id="service-sort"
              value={params.sort}
              onChange={(event) =>
                updateParams({ sort: event.target.value as typeof params.sort }, true)
              }
              className={fieldClass}
            >
              {BROWSE_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <p className="self-center text-xs text-muted sm:text-right">
            Showing {result?.data.length ?? 0} of {count}
          </p>
        </div>
      </section>

      {isLoading && (
        <div className="mt-8">
          <ServicesSkeleton compact />
        </div>
      )}

      {!isLoading && errorMessage && (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-error/30 bg-card p-10 text-center"
        >
          <AlertCircle size={28} className="mx-auto text-error" aria-hidden="true" />
          <h2 className="mt-4 font-serif text-xl text-foreground">
            We couldn&apos;t load services
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => setRetryCount((value) => value + 1)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <RotateCcw size={15} aria-hidden="true" />
            Try again
          </button>
        </div>
      )}

      {!isLoading && !errorMessage && result && (
        <>
          {result.data.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-border/80 bg-card/70 px-6 py-16 text-center">
              <SearchX size={30} className="mx-auto text-accent" aria-hidden="true" />
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
                  <RotateCcw size={14} aria-hidden="true" />
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <motion.div
              className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
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
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              <button
                type="button"
                disabled={!result.meta.hasPreviousPage}
                onClick={() => updateParams({ page: params.page - 1 })}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <ChevronLeft size={15} aria-hidden="true" />
                Previous
              </button>
              <span aria-current="page" className="px-2 text-sm text-muted">
                Page {result.meta.page} of {result.meta.totalPages}
              </span>
              <button
                type="button"
                disabled={!result.meta.hasNextPage}
                onClick={() => updateParams({ page: params.page + 1 })}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Next
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
