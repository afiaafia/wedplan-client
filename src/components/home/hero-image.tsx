"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function HeroImage() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.85, delay: 0.06, ease: EASE }}
      className="relative mx-auto w-full max-w-[620px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-5 -top-6 h-32 w-32 rounded-full border border-champagne/40 sm:h-40 sm:w-40"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-7 -left-5 h-40 w-40 rounded-full border border-accent/30 sm:h-52 sm:w-52"
      />

      <div className="relative h-[380px] w-full overflow-hidden rounded-[32px] bg-secondary shadow-[0_30px_80px_rgba(48,39,42,0.16)] ring-1 ring-white/60 sm:h-[460px] sm:rounded-[40px] lg:h-[560px]">
        <motion.div
          initial={reduceMotion ? false : { scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.05, delay: 0.04, ease: EASE }}
          className="absolute inset-0"
        >
          <Image
            src={HERO_IMAGE}
            alt="A bride and groom exchanging vows in a warm, sunlit wedding ceremony surrounded by flowers"
            fill
            preload
            sizes="(max-width: 1024px) 100vw, 48vw"
            className="object-cover"
            style={{ objectPosition: "center 45%" }}
          />
        </motion.div>

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#30272a]/50 via-[#30272a]/5 to-transparent"
        />

        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-white sm:inset-x-7 sm:bottom-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/75">
              The WedPlan edit
            </p>
            <p className="mt-2 font-serif text-2xl italic sm:text-3xl">
              Made for your moment.
            </p>
          </div>
          <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/10 backdrop-blur-sm sm:flex">
            <Heart size={18} strokeWidth={1.6} aria-hidden="true" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
