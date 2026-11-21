import { FEATURED_SERVICES_LIMIT } from "@/lib/featured-services-api";
import FeaturedServicesHeader from "./featured-services-header";

export default function FeaturedServicesSkeleton() {
  return (
    <section
      aria-labelledby="featured-services-heading"
      className="px-4 pb-20 pt-4 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1380px]">
        <FeaturedServicesHeader />

        <div aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading featured wedding services</span>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: FEATURED_SERVICES_LIMIT }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-border/80 bg-card/70"
              >
                <div className="aspect-[4/3] animate-pulse bg-secondary" />
                <div className="space-y-3 p-5 sm:p-6">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-secondary" />
                  <div className="h-4 w-full animate-pulse rounded bg-secondary" />
                  <div className="h-16 animate-pulse rounded-xl bg-secondary" />
                  <div className="mt-5 h-9 w-full animate-pulse rounded bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
