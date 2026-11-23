import Link from "next/link";
import { AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import {
  FEATURED_SERVICES_LIMIT,
  FEATURED_SERVICES_LIST_HREF,
  type FeaturedService,
} from "@/lib/featured-services-api";
import { getHomepageFeaturedServices } from "@/lib/homepage-featured-services";
import FeaturedServiceCard from "./featured-service-card";
import FeaturedServicesHeader from "./featured-services-header";

export default async function FeaturedWeddingServices() {
  let services: FeaturedService[] = [];
  let errorMessage: string | null = null;

  try {
    const response = await getHomepageFeaturedServices();
    services = response.data.services.slice(0, FEATURED_SERVICES_LIMIT);
  } catch (error) {
    errorMessage =
      error instanceof Error && error.message
        ? error.message
        : "Unable to load featured services right now.";
  }

  return (
    <section
      aria-labelledby="featured-services-heading"
      className="px-4 pb-12 pt-2 sm:px-6 md:pb-16 lg:px-10 lg:pb-20 lg:pt-4"
    >
      <div className="mx-auto max-w-345">
        <FeaturedServicesHeader />

        {errorMessage ? (
          <div
            role="alert"
            className="rounded-2xl border border-error/30 bg-error/10 p-6 text-center lg:p-8"
          >
            <AlertCircle
              size={28}
              strokeWidth={1.5}
              className="mx-auto text-error"
            />
            <h3 className="mt-3 font-serif text-xl text-foreground">
              We couldn&apos;t load featured services
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              {errorMessage}
            </p>
            <Link
              href={FEATURED_SERVICES_LIST_HREF}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Browse services
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center lg:p-10">
            <Sparkles
              size={28}
              strokeWidth={1.5}
              className="mx-auto text-champagne"
            />
            <h3 className="mt-3 font-serif text-xl text-foreground">
              No featured services yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Approved, active services will appear here as soon as they are
              available. You can explore everything currently listed in the
              meantime.
            </p>
            <Link
              href={FEATURED_SERVICES_LIST_HREF}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              View All Services
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {services.map((service) => (
              <FeaturedServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
