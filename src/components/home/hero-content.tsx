"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function HeroContent() {
  const reduceMotion = useReducedMotion();

  const fadeUp = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: EASE },
  });

  return (
    <div className="relative z-10 max-w-xl">
      <motion.div
        {...fadeUp(0)}
        className="inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-card/70 px-4 py-2 shadow-sm backdrop-blur-sm"
      >
        <Sparkles size={14} className="text-champagne" aria-hidden="true" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          YOUR DAY. YOUR DREAM. YOUR WAY.
        </span>
      </motion.div>

      <motion.h1
        {...fadeUp(0.06)}
        id="hero-heading"
        className="mt-7 font-serif text-[clamp(2.75rem,5vw,4.5rem)] leading-[1.04] tracking-[-0.04em] text-foreground"
      >
        Plan Your Perfect
        <br className="hidden lg:block" /> Wedding,{" "}
        <span className="italic text-primary">Beautifully.</span>
      </motion.h1>

      <motion.p
        {...fadeUp(0.12)}
        className="mt-6 max-w-lg text-[15px] leading-8 text-muted sm:text-base"
      >
        Discover wedding services, explore talented vendors, and bring every
        detail of your special day together in one place.
      </motion.p>

      <motion.div
        {...fadeUp(0.18)}
        className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
      >
        <Link
          href="/services"
          aria-label="Explore wedding services on WedPlan"
          className="group inline-flex items-center justify-center gap-3 rounded-full bg-primary px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Explore Wedding Services
          <ArrowRight
            size={17}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>

        <Link
          href="/vendor/sign-in"
          aria-label="Join as a vendor on WedPlan"
          className="group inline-flex items-center justify-center gap-3 rounded-full border border-border bg-card/60 px-7 py-4 text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-secondary/70 hover:text-primary hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          Join as a Vendor
          <ArrowRight
            size={17}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          />
        </Link>
      </motion.div>
    </div>
  );
}
