import { Suspense } from "react";
import HeroSection from "@/components/home/hero-section";
import ServiceCategories from "@/components/home/service-categories";
import FeaturedServicesSkeleton from "@/components/home/featured-services-skeleton";
import FeaturedWeddingServices from "@/components/home/featured-wedding-services";
import WhyChooseWedPlan from "@/components/home/why-choose-wedplan";
import HowItWorks from "@/components/home/how-it-works";
import LoveNotes from "@/components/home/love-notes";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ServiceCategories />
      <Suspense fallback={<FeaturedServicesSkeleton />}>
        <FeaturedWeddingServices />
      </Suspense>
      <WhyChooseWedPlan />
      <HowItWorks />
      <LoveNotes />
    </main>
  );
}
