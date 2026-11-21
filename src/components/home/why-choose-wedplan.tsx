"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  BadgeCheck,
  CalendarCheck2,
  ClipboardList,
  LayoutDashboard,
  LayoutGrid,
  Search,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const benefits = [
  {
    icon: Search,
    title: "Search without the stress",
    description:
      "Find services by keyword, category and location, then sort by newest or price to suit your plans.",
  },
  {
    icon: LayoutGrid,
    title: "Every category in one place",
    description:
      "Explore photography, venues, décor, catering, beauty and more from a single organized directory.",
  },
  {
    icon: ClipboardList,
    title: "Clear details and pricing",
    description:
      "See descriptions, locations and starting prices up front, with full service details one click away.",
  },
  {
    icon: CalendarCheck2,
    title: "Request a booking directly",
    description:
      "Choose your event date and location, add a note, and send a booking request straight from a service page.",
  },
  {
    icon: BadgeCheck,
    title: "Vendor-owned, reviewed listings",
    description:
      "Wedding professionals maintain their own listings, which administrators review before they go live.",
  },
  {
    icon: LayoutDashboard,
    title: "A dashboard for every role",
    description:
      "Couples, vendors and administrators each have a dedicated space to manage their WedPlan activity.",
  },
] as const;

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export default function WhyChooseWedPlan() {
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
      aria-labelledby="why-choose-heading"
      className="px-4 py-20 sm:px-6 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-[1380px]">
        <motion.header
          {...revealProps}
          variants={itemVariants}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
            Why WedPlan
          </p>
          <h2
            id="why-choose-heading"
            className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl"
          >
            Planning made simpler, from first idea to final detail
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
            A calm, organized way to discover wedding services and keep your
            planning moving.
          </p>
        </motion.header>

        <motion.div
          {...revealProps}
          variants={containerVariants}
          className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <motion.article
                key={benefit.title}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-[0_8px_30px_rgba(48,39,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_18px_45px_rgba(48,39,42,0.1)] motion-reduce:hover:translate-y-0 sm:p-7"
              >
                <span className="absolute right-5 top-4 font-serif text-4xl text-secondary sm:text-5xl">
                  0{index + 1}
                </span>

                <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-white motion-reduce:transition-none">
                  <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                </span>

                <h3 className="relative mt-5 font-serif text-lg leading-snug text-foreground sm:text-xl">
                  {benefit.title}
                </h3>
                <p className="relative mt-2 text-sm leading-6 text-muted">
                  {benefit.description}
                </p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
