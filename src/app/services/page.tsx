import type { Metadata } from "next";
import { Suspense } from "react";
import BrowseServices from "@/components/services/browse-services";
import ServicesSkeleton from "@/components/services/services-skeleton";

export const metadata: Metadata = {
  title: "Browse Services",
  description:
    "Discover approved wedding professionals by category, location, and price on WedPlan.",
};

export default function ServicesPage() {
  return (
    <main className="min-h-screen px-4 pb-20 pt-32 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1380px]">
        <header className="mb-9 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
            The collection
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
            Browse Wedding Services
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            Explore approved vendors and venues, then refine your search to find
            the right people for your celebration.
          </p>
        </header>

        <Suspense fallback={<ServicesSkeleton />}>
          <BrowseServices />
        </Suspense>
      </div>
    </main>
  );
}
