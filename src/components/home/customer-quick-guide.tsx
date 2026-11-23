"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ArrowRight,
  CalendarCheck2,
  CircleUserRound,
  Search,
  Send,
  type LucideIcon,
} from "lucide-react";

const guideSteps: ReadonlyArray<{
  title: string;
  detail: string;
  href: string;
  linkLabel: string;
  icon: LucideIcon;
}> = [
  {
    title: "Create Account",
    detail:
      "Sign up for a Customer account or sign in to reach your wedding dashboard.",
    href: "/sign-up",
    linkLabel: "Create an account",
    icon: CircleUserRound,
  },
  {
    title: "Explore Services",
    detail:
      "Browse services, filter by category or location, and compare listing details and pricing.",
    href: "/services",
    linkLabel: "Browse services",
    icon: Search,
  },
  {
    title: "Request Booking",
    detail:
      "Open a service, choose a future event date, add event details, and send your request.",
    href: "/services",
    linkLabel: "Find a service",
    icon: Send,
  },
  {
    title: "Track Progress",
    detail:
      "Visit My Bookings to follow request updates and manage pending requests.",
    href: "/dashboard/customer/bookings",
    linkLabel: "View My Bookings",
    icon: CalendarCheck2,
  },
];

export default function CustomerQuickGuide({
  reduceMotion,
  isInView,
}: {
  reduceMotion: boolean;
  isInView: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      aria-labelledby="customer-guide-heading"
      className="mt-3 rounded-2xl border border-border/80 bg-card/70 p-3 shadow-[0_6px_22px_rgba(48,39,42,0.035)] sm:p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3
            id="customer-guide-heading"
            className="font-serif text-lg leading-tight text-foreground sm:text-xl"
          >
            Customer Quick Guide
          </h3>
          <p className="mt-1 text-xs leading-4 text-muted">
            New to WedPlan? Follow these simple steps to get started.
          </p>
        </div>
        <button
          type="button"
          aria-label={
            isExpanded
              ? "Close Customer Quick Guide"
              : "Open Customer Quick Guide"
          }
          aria-expanded={isExpanded}
          aria-controls="customer-guide-details"
          onClick={() => setIsExpanded((current) => !current)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-champagne/60 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ChevronDown
            size={15}
            className={`transition-transform duration-200 motion-reduce:transition-none ${
              isExpanded ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      </div>

      <ol
        aria-label="Customer quick guide steps"
        className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {guideSteps.map(({ title, icon: Icon }, index) => (
          <li
            key={title}
            className="flex min-h-9 min-w-0 items-center gap-2 rounded-lg bg-background/80 px-2 py-1.5"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <Icon size={13} aria-hidden="true" />
            </span>
            <span className="min-w-0 text-[11px] font-medium leading-4 text-foreground">
              {index + 1}. {title}
            </span>
            {index < guideSteps.length - 1 && (
              <ArrowRight
                size={12}
                className="ml-auto hidden shrink-0 text-champagne sm:block"
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>

      <motion.div
        id="customer-guide-details"
        aria-hidden={!isExpanded}
        inert={!isExpanded}
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{
          duration: reduceMotion || !isInView ? 0 : 0.22,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="overflow-hidden"
      >
        <ol className="grid gap-2 pt-3 sm:grid-cols-2">
          {guideSteps.map(({ title, detail, href, linkLabel }, index) => (
            <li
              key={title}
              className="rounded-xl border border-border/70 bg-background/70 p-3"
            >
              <p className="text-xs font-semibold text-foreground">
                <span className="mr-1.5 text-champagne">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {title}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">{detail}</p>
              <Link
                href={href}
                className="mt-1 inline-flex min-h-8 items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {linkLabel}
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </motion.div>
    </section>
  );
}
