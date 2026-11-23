import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FEATURED_SERVICES_LIST_HREF } from "@/lib/featured-services-api";

export default function FeaturedServicesHeader() {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between lg:mb-10 lg:gap-5">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
          Curated for your day
        </p>
        <h2
          id="featured-services-heading"
          className="mt-2 font-serif text-2xl leading-tight tracking-tight text-foreground lg:mt-3 lg:text-4xl"
        >
          Featured Wedding Services
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted lg:mt-3 lg:text-base lg:leading-7">
          Discover talented professionals and trusted vendors to make your
          wedding unforgettable.
        </p>
      </div>

      <Link
        href={FEATURED_SERVICES_LIST_HREF}
        className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:self-auto lg:px-5 lg:text-sm"
      >
        View All Services
        <ArrowRight size={15} />
      </Link>
    </header>
  );
}
