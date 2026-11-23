"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  Camera,
  Flower2,
  Shirt,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import {
  HOME_CATEGORIES,
  homeCategoryHref,
  type HomeCategoryIcon,
} from "@/lib/home-categories";

const EASE = [0.22, 1, 0.36, 1] as const;

const ICONS: Record<HomeCategoryIcon, typeof Camera> = {
  photography: Camera,
  venue: Building2,
  decoration: Flower2,
  catering: UtensilsCrossed,
  makeup: Sparkles,
  fashion: Shirt,
};

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

export default function ServiceCategories() {
  const reduceMotion = useReducedMotion();
  const revealProps = reduceMotion
    ? ({ initial: false } as const)
    : ({
        initial: "hidden",
        whileInView: "show",
        viewport: { once: true, amount: 0.15 },
      } as const);

  return (
    <section
      aria-labelledby="categories-heading"
      className="bg-secondary/45 px-4 py-12 sm:px-6 md:py-16 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-[1380px]">
        <motion.header
          {...revealProps}
          variants={itemVariants}
          className="mb-6 max-w-2xl lg:mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
            Explore by category
          </p>
          <h2
            id="categories-heading"
            className="mt-2 font-serif text-2xl leading-tight tracking-tight text-foreground lg:mt-3 lg:text-4xl"
          >
            Every detail, beautifully covered
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted lg:mt-3 lg:text-base lg:leading-7">
            From the first photograph to the final flourish, find the right
            professionals for each part of your celebration.
          </p>
        </motion.header>

        <motion.div
          {...revealProps}
          variants={containerVariants}
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5"
        >
          {HOME_CATEGORIES.map((category) => (
            <CategoryCard key={category.category} category={category} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CategoryCard({
  category,
}: {
  category: (typeof HOME_CATEGORIES)[number];
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const Icon = ICONS[category.icon];

  return (
    <motion.div variants={itemVariants}>
      <Link
        href={homeCategoryHref(category)}
        aria-label={`Browse ${category.label} services`}
        className="group relative flex h-[194px] flex-col justify-end overflow-hidden rounded-xl bg-[#3b2d31] shadow-[0_8px_30px_rgba(48,39,42,0.08)] outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(48,39,42,0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:hover:translate-y-0 sm:h-[220px] sm:rounded-2xl lg:h-72"
      >
        {!imageFailed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={category.image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}

        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#30272a]/90 via-[#30272a]/40 to-[#30272a]/5"
        />

        <span         className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/50 bg-white/15 text-white backdrop-blur-sm transition-colors group-hover:bg-white group-hover:text-primary motion-reduce:transition-none sm:right-4 sm:top-4 sm:h-9 sm:w-9 lg:right-5 lg:top-5 lg:h-10 lg:w-10">
          <ArrowUpRight size={18} aria-hidden="true" />
        </span>

        <span
          aria-hidden="true"
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm sm:left-4 sm:top-4 sm:h-9 sm:w-9 lg:left-5 lg:top-5 lg:h-10 lg:w-10"
        >
          <Icon size={17} strokeWidth={1.7} />
        </span>

        <span className="relative z-10 p-4 sm:p-5 lg:p-6">
          <span className="block font-serif text-base leading-tight text-white sm:text-lg lg:text-2xl">
            {category.label}
          </span>
          <span className="mt-1 block text-[11px] leading-4 text-white/75 sm:text-xs sm:leading-5">
            {category.description}
          </span>
        </span>
      </Link>
    </motion.div>
  );
}
