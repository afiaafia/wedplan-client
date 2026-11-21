"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck2,
  ClipboardList,
  Compass,
  HeartHandshake,
  Search,
  Sparkles,
  Store,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Step {
  title: string;
  description: string;
  icon: typeof Search;
  cta: { label: string; href: string };
}

const steps: readonly Step[] = [
  {
    title: "Explore Services",
    description:
      "Open Browse Services and narrow things down by keyword, category or location.",
    icon: Compass,
    cta: { label: "Browse services", href: "/services" },
  },
  {
    title: "Discover Providers",
    description:
      "Open a listing to see photos, service details, starting price, location and vendor information.",
    icon: Search,
    cta: { label: "See listings", href: "/services" },
  },
  {
    title: "Review Your Options",
    description:
      "Sort by price or newest listings and revisit different services before you decide.",
    icon: Sparkles,
    cta: { label: "Sort by price", href: "/services?sort=price_asc" },
  },
  {
    title: "Sign In or Join",
    description:
      "Create a customer account or sign in — an account is needed before you can request a booking.",
    icon: HeartHandshake,
    cta: { label: "Create account", href: "/sign-up" },
  },
  {
    title: "Request a Booking",
    description:
      "On a service page, choose your event date and location, add an optional note, and send your request.",
    icon: CalendarCheck2,
    cta: { label: "Explore services", href: "/services" },
  },
  {
    title: "Manage Your Booking",
    description:
      "Track your request status and cancel a pending booking from your customer dashboard.",
    icon: ClipboardList,
    cta: { label: "View my bookings", href: "/dashboard/customer/bookings" },
  },
  {
    title: "List Your Services",
    description:
      "Vendors can add and manage their own listings in the vendor dashboard before admin approval makes them public.",
    icon: Store,
    cta: { label: "Join as a vendor", href: "/sign-up?role=vendor" },
  },
];

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();
  const revealProps = reduceMotion
    ? ({ initial: false } as const)
    : ({
        initial: "hidden",
        whileInView: "show",
        viewport: { once: true, amount: 0.12 },
      } as const);

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="overflow-hidden bg-gradient-to-b from-secondary/55 to-background px-4 py-20 sm:px-6 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-[1380px]">
        <motion.header
          {...revealProps}
          variants={itemVariants}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl"
          >
            A simpler path to your wedding checklist
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
            A few clear steps from browsing your first service to managing your
            bookings and listings.
          </p>
        </motion.header>

        <motion.ol
          {...revealProps}
          variants={containerVariants}
          className="relative mt-12 grid grid-cols-1 gap-5 sm:mt-14 md:grid-cols-2 lg:grid-cols-3"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.li
                key={step.title}
                variants={itemVariants}
                className="group relative flex h-full flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-[0_8px_30px_rgba(48,39,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_18px_45px_rgba(48,39,42,0.1)] motion-reduce:hover:translate-y-0 sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-white motion-reduce:transition-none">
                    <Icon size={21} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-serif text-4xl leading-none text-secondary sm:text-5xl"
                  >
                    0{index + 1}
                  </span>
                </div>

                <h3 className="mt-5 font-serif text-lg leading-snug text-foreground sm:text-xl">
                  {step.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted">
                  {step.description}
                </p>

                <Link
                  href={step.cta.href}
                  className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {step.cta.label}
                  <ArrowRight
                    size={15}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  />
                </Link>
              </motion.li>
            );
          })}
        </motion.ol>
      </div>
    </section>
  );
}
