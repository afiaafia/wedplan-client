import { Suspense } from "react";
import { getHomepageFeaturedServices } from "@/lib/homepage-featured-services";
import HeroImage from "./hero-image";

function HeroCarouselFallback() {
  return (
    <div
      aria-label="Loading wedding service inspiration"
      aria-busy="true"
      className="relative h-[clamp(240px,72vw,310px)] w-full animate-pulse overflow-hidden rounded-3xl bg-secondary sm:h-90 sm:rounded-[36px] lg:h-130"
    >
      <div className="absolute inset-x-6 bottom-7 space-y-3">
        <div className="h-4 w-28 rounded-full bg-card/60" />
        <div className="h-8 w-2/3 rounded bg-card/60" />
      </div>
    </div>
  );
}

async function getHeroCarouselServices() {
  try {
    const response = await getHomepageFeaturedServices();
    return {
      services: response.data.services,
      dataUnavailable: false,
    };
  } catch {
    return {
      services: [],
      dataUnavailable: true,
    };
  }
}

async function HeroCarouselContent() {
  const data = await getHeroCarouselServices();
  return <HeroImage {...data} />;
}

export default function HeroCarousel() {
  return (
    <Suspense fallback={<HeroCarouselFallback />}>
      <HeroCarouselContent />
    </Suspense>
  );
}
