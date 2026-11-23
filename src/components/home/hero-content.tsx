"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { getPrimaryRole, getRoleDashboard, normalizeRoles } from "@/lib/roles";
import { useHydrationComplete } from "./use-hydration-complete";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function HeroContent() {
  const isHydrated = useHydrationComplete();
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = !isHydrated || prefersReducedMotion !== false;
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const roles = normalizeRoles(user?.roles, user?.role);
  const role = user ? getPrimaryRole(user.role, roles) : null;

  const primaryCta = role
    ? { href: getRoleDashboard(role, roles), label: "Go to Dashboard" }
    : { href: "/services", label: "Explore Wedding Services" };

  const secondaryCta = !role
    ? { href: "/sign-up?role=vendor", label: "Become a Vendor" }
    : role === "customer"
      ? { href: "/vendor/onboarding", label: "Become a Vendor" }
      : role === "admin"
        ? { href: "/vendor", label: "Become a Vendor" }
        : { href: "/services", label: "Explore Wedding Services" };
  const showSecondaryCta = !isPending && role !== "vendor";
  const bookingsHref = !role
    ? `/sign-in?callbackURL=${encodeURIComponent("/dashboard/customer/bookings")}`
    : role === "vendor"
      ? "/dashboard/vendor/bookings"
      : role === "admin"
        ? "/dashboard/admin/bookings"
        : "/dashboard/customer/bookings";
  const dashboardHref = role
    ? getRoleDashboard(role, roles)
    : `/sign-in?callbackURL=${encodeURIComponent("/dashboard/customer")}`;

  const fadeUp = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: EASE },
  });

  return (
    <div className="relative z-10 min-w-0 max-w-xl">
      <motion.div
        {...fadeUp(0)}
        className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3 py-1.5 shadow-sm backdrop-blur-sm sm:gap-2.5 sm:px-4 sm:py-2"
      >
        <Sparkles size={14} className="text-champagne" aria-hidden="true" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          YOUR DREAM WEDDING STARTS HERE
        </span>
      </motion.div>

      <motion.h1
        {...fadeUp(0.06)}
        id="hero-heading"
        className="mt-5 font-serif text-[clamp(2rem,5vw,4.5rem)] leading-[1.06] tracking-[-0.04em] text-foreground lg:mt-7"
      >
        Plan Your Perfect Day,{" "}
        <span className="italic text-primary">Without the Stress.</span>
      </motion.h1>

      <motion.p
        {...fadeUp(0.12)}
        className="mt-4 max-w-lg text-[15px] leading-7 text-muted sm:text-base lg:mt-6 lg:leading-8"
      >
        Discover trusted wedding professionals, explore services, and manage
        every booking in one place.
      </motion.p>

      <motion.div
        {...fadeUp(0.18)}
        className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 lg:mt-7"
      >
        <Link
          href={primaryCta.href}
          aria-label={primaryCta.label}
          className="group inline-flex shrink-0 items-center justify-center gap-3 whitespace-nowrap rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:px-5 lg:py-3.5"
        >
          {primaryCta.label}
          <ArrowRight
            size={17}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>

        {showSecondaryCta && (
          <Link
            href={secondaryCta.href}
            aria-label={secondaryCta.label}
            className="group inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border bg-card/60 px-4 py-3 text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-secondary/70 hover:text-primary hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:px-5 lg:py-3.5"
          >
            {secondaryCta.label}
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            />
          </Link>
        )}
      </motion.div>

      <motion.ul
        {...fadeUp(0.24)}
        className="mt-5 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] font-medium text-muted sm:mt-8 sm:grid-cols-3 sm:gap-2 lg:mt-7"
      >
        <li>
          <Link
            href="/services"
            aria-label="Browse trusted wedding vendors and services"
            className="group flex items-center gap-2 rounded-md p-1 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            <BadgeCheck
              size={16}
              className="shrink-0 text-champagne transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
            <span>Trusted Wedding Vendors</span>
          </Link>
        </li>
        <li>
          <Link
            href={bookingsHref}
            aria-label="Open booking management"
            className="group flex items-center gap-2 rounded-md p-1 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            <CalendarCheck
              size={16}
              className="shrink-0 text-champagne transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
            <span>Easy Booking Management</span>
          </Link>
        </li>
        <li>
          <Link
            href={dashboardHref}
            aria-label="Open your WedPlan dashboard"
            className="group flex items-center gap-2 rounded-md p-1 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            <LayoutDashboard
              size={16}
              className="shrink-0 text-champagne transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
            <span>Everything in One Place</span>
          </Link>
        </li>
      </motion.ul>
    </div>
  );
}
