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
      className="bg-secondary/45 px-4 py-20 sm:px-6 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-[1380px]">
        <motion.header
          {...revealProps}
          variants={itemVariants}
          className="mb-9 max-w-2xl sm:mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
            Explore by category
          </p>
          <h2
            id="categories-heading"
            className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl"
          >
            Every detail, beautifully covered
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
            From the first photograph to the final flourish, find the right
            professionals for each part of your celebration.
          </p>
        </motion.header>

        <motion.div
          {...revealProps}
          variants={containerVariants}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
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
        className="group relative flex h-64 flex-col justify-end overflow-hidden rounded-2xl bg-[#3b2d31] shadow-[0_8px_30px_rgba(48,39,42,0.08)] outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(48,39,42,0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:hover:translate-y-0 sm:h-72"
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

        <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/15 text-white backdrop-blur-sm transition-colors group-hover:bg-white group-hover:text-primary motion-reduce:transition-none">
          <ArrowUpRight size={18} aria-hidden="true" />
        </span>

        <span
          aria-hidden="true"
          className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm"
        >
          <Icon size={17} strokeWidth={1.7} />
        </span>

        <span className="relative z-10 p-5 sm:p-6">
          <span className="block font-serif text-xl leading-tight text-white sm:text-2xl">
            {category.label}
          </span>
          <span className="mt-1.5 block text-xs text-white/75">
            {category.description}
          </span>
        </span>
      </Link>
    </motion.div>
  );
}
