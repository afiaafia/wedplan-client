import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FEATURED_SERVICES_LIST_HREF } from "@/lib/featured-services-api";

export default function FeaturedServicesHeader() {
  return (
    <header className="mb-9 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
          Curated for your day
        </p>
        <h2
          id="featured-services-heading"
          className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl"
        >
          Featured Wedding Services
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
          Discover talented professionals and trusted vendors to make your
          wedding unforgettable.
        </p>
      </div>

      <Link
        href={FEATURED_SERVICES_LIST_HREF}
        className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:self-auto"
      >
        View All Services
        <ArrowRight size={15} />
      </Link>
    </header>
  );
}
