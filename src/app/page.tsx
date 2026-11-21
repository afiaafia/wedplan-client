import { Suspense } from "react";
import HeroSection from "@/components/home/hero-section";
import FeaturedServicesSkeleton from "@/components/home/featured-services-skeleton";
import FeaturedWeddingServices from "@/components/home/featured-wedding-services";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <Suspense fallback={<FeaturedServicesSkeleton />}>
        <FeaturedWeddingServices />
      </Suspense>
    </main>
  );
}
