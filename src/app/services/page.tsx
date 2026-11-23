import type { Metadata } from "next";
import { Suspense } from "react";
import BrowseServices from "@/components/services/browse-services";
import ServicesSkeleton from "@/components/services/services-skeleton";

export const metadata: Metadata = {
  title: "Explore Wedding Services",
  description:
    "Discover approved wedding professionals by category, location, and price on WedPlan.",
};

export default function ServicesPage() {
  return (
    <main className="min-h-screen px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:px-10">
      <div className="mx-auto max-w-345">
        <Suspense fallback={<ServicesSkeleton />}>
          <BrowseServices />
        </Suspense>
      </div>
    </main>
  );
}
