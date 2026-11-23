"use client";

import type { FormEvent } from "react";
import { Search, Sparkles } from "lucide-react";

interface ServicesPageHeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  count: number;
  isLoading: boolean;
}

export default function ServicesPageHeader({
  query,
  onQueryChange,
  onSearch,
  count,
  isLoading,
}: ServicesPageHeaderProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch();
  }

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-border/70 bg-linear-to-br from-secondary via-card to-secondary px-5 py-9 sm:px-9 sm:py-12 lg:px-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-accent/25 sm:h-96 sm:w-96"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 right-24 h-64 w-64 rounded-full border border-champagne/25 sm:h-80 sm:w-80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative z-10 max-w-3xl">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
          <Sparkles size={14} aria-hidden="true" />
          The WedPlan collection
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Explore Wedding Services
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
          Find the people who will bring your day to life. Search trusted
          photographers, venues, florists, and more—then refine by location and
          price.
        </p>

        <form
          onSubmit={handleSubmit}
          role="search"
          className="mt-7 flex w-full max-w-2xl flex-col gap-2.5 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <label htmlFor="service-search" className="sr-only">
              Search wedding services by name
            </label>
            <input
              id="service-search"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search services, e.g. photography"
              autoComplete="off"
              className="h-12 w-full rounded-full border border-border bg-card/90 pl-11 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted/70 focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <button
            type="submit"
            className="h-12 shrink-0 rounded-full bg-primary px-7 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Search
          </button>
        </form>

        <p
          aria-live="polite"
          className="mt-5 text-sm font-medium text-muted"
        >
          {isLoading
            ? "Finding services for you…"
            : `${count.toLocaleString()} ${count === 1 ? "service" : "services"} available`}
        </p>
      </div>
    </section>
  );
}
