"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Autoplay, EffectFade, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import {
  featuredServiceHref,
  firstAvailableImage,
  type FeaturedService,
} from "@/lib/featured-services-api";
import type { ServiceCategory } from "@/lib/services-api";
import { useHydrationComplete } from "./use-hydration-complete";

const SLIDE_THEMES: {
  title: string;
  caption: string;
  image: string;
  categories: ServiceCategory[];
}[] = [
  {
    title: "Wedding Venues",
    caption: "Find the perfect place for your celebration.",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1800&q=85",
    categories: ["Wedding Venue"],
  },
  {
    title: "Photography",
    caption: "Capture every unforgettable moment.",
    image:
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1800&q=85",
    categories: ["Photography"],
  },
  {
    title: "Decoration & Florals",
    caption: "Bring your wedding vision to life.",
    image:
      "https://images.unsplash.com/photo-1519225421980-888cb7a5bd53?auto=format&fit=crop&w=1800&q=85",
    categories: ["Decoration"],
  },
  {
    title: "Catering & Planning",
    caption: "Make every detail feel effortless.",
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1800&q=85",
    categories: ["Catering", "Wedding Planning"],
  },
];

function getSlideServices(services: FeaturedService[]) {
  const claimedServiceIds = new Set<string>();

  return SLIDE_THEMES.map((theme) => {
    const service = services.find(
      (candidate) =>
        !claimedServiceIds.has(candidate.id) &&
        theme.categories.includes(candidate.category) &&
        candidate.title.trim().length > 0
    );

    if (service) claimedServiceIds.add(service.id);
    return { ...theme, service };
  });
}

function WeddingSlide({
  slide,
  index,
  active,
  preload,
}: {
  slide: ReturnType<typeof getSlideServices>[number];
  index: number;
  active: boolean;
  preload: boolean;
}) {
  const [serviceImageFailed, setServiceImageFailed] = useState(false);
  const [fallbackImageFailed, setFallbackImageFailed] = useState(false);
  const serviceImage = slide.service
    ? firstAvailableImage(slide.service.images)
    : undefined;
  const image = serviceImage && !serviceImageFailed ? serviceImage : slide.image;
  const showImage = !fallbackImageFailed;

  return (
    <article
      aria-hidden={!active}
      className="relative h-full w-full overflow-hidden bg-[#e8dcd4]"
    >
      {showImage && (
        <Image
          src={image}
          alt={
            slide.service
              ? slide.service.title
              : `${slide.title} wedding inspiration`
          }
          fill
          unoptimized={Boolean(serviceImage && !serviceImageFailed)}
          preload={preload}
          sizes="(max-width: 1024px) 100vw, 48vw"
          onError={() => {
            if (serviceImage && !serviceImageFailed) {
              setServiceImageFailed(true);
            } else {
              setFallbackImageFailed(true);
            }
          }}
          className={`object-cover transition-transform duration-[6000ms] ease-out motion-reduce:transition-none ${
            active ? "scale-[1.035]" : "scale-100"
          }`}
          style={{ objectPosition: "center 45%" }}
        />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-[#21191a]/80 via-[#21191a]/15 to-[#21191a]/5"
      />

      <div
        className={`absolute inset-0 transition-opacity duration-200 motion-reduce:transition-none ${
          active ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3 sm:inset-x-7 sm:top-7">
          <span className="rounded-full border border-white/35 bg-[#30272a]/20 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.17em] text-white/90 backdrop-blur-md sm:text-[10px]">
            {slide.service ? "Featured service" : "Category inspiration"}
          </span>
          <span className="font-serif text-sm tracking-[0.08em] text-white/90">
            {String(index + 1).padStart(2, "0")}
            <span className="mx-1.5 text-white/50">/</span>
            {String(SLIDE_THEMES.length).padStart(2, "0")}
          </span>
        </div>

        <div className="absolute inset-x-4 bottom-17 max-w-[84%] text-white sm:inset-x-7 sm:bottom-22">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75 sm:text-[11px]">
            {slide.title}
          </p>
          {slide.service && active ? (
            <Link
              href={featuredServiceHref(slide.service.id)}
              className="mt-2 inline-block font-serif text-[clamp(1.7rem,3vw,2.4rem)] leading-tight tracking-[-0.025em] text-white decoration-white/60 underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {slide.service.title}
            </Link>
          ) : (
            <h2 className="mt-2 font-serif text-[clamp(1.7rem,3vw,2.4rem)] leading-tight tracking-[-0.025em]">
              {slide.service?.title || slide.title}
            </h2>
          )}
          <p className="mt-2 max-w-md text-xs leading-5 text-white/85 sm:text-sm sm:leading-6">
            {slide.caption}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function HeroImage({
  services,
  dataUnavailable,
}: {
  services: FeaturedService[];
  dataUnavailable: boolean;
}) {
  const isHydrated = useHydrationComplete();
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = !isHydrated || prefersReducedMotion !== false;
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = getSlideServices(services);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto min-w-0 w-full max-w-170"
    >
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Wedding service categories"
        className="relative h-[clamp(240px,72vw,310px)] overflow-hidden rounded-3xl bg-secondary shadow-[0_20px_48px_rgba(48,39,42,0.14)] ring-1 ring-white/70 sm:h-90 sm:rounded-[36px] lg:h-130 lg:shadow-[0_28px_75px_rgba(48,39,42,0.17)]"
      >
        <Swiper
          modules={[Autoplay, EffectFade, Keyboard]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          loop
          speed={reduceMotion ? 0 : 850}
          autoplay={
            reduceMotion
              ? false
              : {
                  delay: 4500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
          }
          keyboard={{ enabled: true, onlyInViewport: true }}
          onSwiper={setSwiper}
          onSlideChange={(instance) => setActiveIndex(instance.realIndex)}
          className="h-full w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.title}>
              <WeddingSlide
                slide={slide}
                index={index}
                active={activeIndex === index}
                preload={index === 0}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex items-center justify-between gap-3 sm:inset-x-7 sm:bottom-7">
          <div
            role="group"
            aria-label="Carousel pagination"
            className="pointer-events-auto flex items-center gap-2"
          >
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => swiper?.slideToLoop(index)}
                aria-label={`Show slide ${index + 1}: ${slide.title}`}
                aria-current={activeIndex === index ? "true" : undefined}
                className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none ${
                  activeIndex === index
                    ? "w-7 bg-white"
                    : "w-2 bg-white/55 hover:bg-white/85"
                }`}
              />
            ))}
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => swiper?.slidePrev()}
              aria-label="Previous wedding service category"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none sm:h-11 sm:w-11"
            >
              <ArrowLeft size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => swiper?.slideNext()}
              aria-label="Next wedding service category"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none sm:h-11 sm:w-11"
            >
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {dataUnavailable && (
        <p role="status" className="sr-only">
          Featured services are unavailable right now. Showing wedding category
          inspiration instead.
        </p>
      )}
    </motion.div>
  );
}
