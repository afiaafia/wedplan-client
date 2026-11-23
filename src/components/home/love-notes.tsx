"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const testimonials = [
  {
    names: "Sophia & Liam Harrison",
    location: "Napa Valley, CA",
    date: "Married October 2025",
    quote:
      "WedPlan helped us find our dream garden estate, floral designer, and editorial photographer in a single weekend. Tracking every booking status in one place removed all the stress.",
  },
  {
    names: "Amara & Daniel Vance",
    location: "Austin, TX",
    date: "Married May 2026",
    quote:
      "Being able to filter vendors by location and compare pricing transparently saved us weeks of back-and-forth emails. Every vendor we booked was responsive and extraordinary.",
  },
  {
    names: "Clara & Ethan Brooks",
    location: "Charleston, SC",
    date: "Married August 2026",
    quote:
      "From bridal styling to multi-course catering, WedPlan connected us with verified artisans who understood our vision from day one.",
  },
] as const;

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export default function LoveNotes() {
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
      aria-labelledby="love-notes-heading"
      className="bg-[#f8f4f0] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12"
    >
      <div className="mx-auto max-w-[1180px]">
        <motion.header
          {...(reduceMotion ? { initial: false } : {
            initial: { opacity: 0, y: 12 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, amount: 0.3 },
            transition: { duration: 0.45, ease: EASE },
          })}
          className="mb-5 text-center lg:mb-8"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-champagne sm:text-xs">
            LOVE NOTES
          </p>
          <h2
            id="love-notes-heading"
            className="mt-1.5 font-serif text-2xl leading-tight tracking-tight text-[#30272a] lg:mt-2 lg:text-3xl"
          >
            Stories From Happy Couples
          </h2>
          <p className="mt-1.5 text-[11px] text-[#756b67]">
            Illustrative sample testimonials
          </p>
        </motion.header>

        <motion.div
          {...revealProps}
          variants={listVariants}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <motion.article
              key={testimonial.names}
              variants={itemVariants}
              className="flex h-full min-w-0 flex-col rounded-xl border border-[#e4d9d0] bg-white/65 p-4 shadow-[0_8px_28px_rgba(48,39,42,0.045)] sm:rounded-2xl sm:p-5 lg:p-6"
            >
              <span
                aria-hidden="true"
                className="font-serif text-4xl leading-[0.65] text-champagne/70 lg:text-5xl"
              >
                “
              </span>
              <blockquote className="mt-2 flex-1 lg:mt-3">
                <p className="font-serif text-sm leading-6 text-[#30272a] lg:text-base lg:leading-7">
                  {testimonial.quote}
                </p>
                <footer className="mt-4 border-t border-[#e4d9d0] pt-3 lg:mt-5 lg:pt-4">
                  <cite className="not-italic text-[13px] font-semibold text-[#30272a] lg:text-sm">
                    {testimonial.names}
                  </cite>
                  <p className="mt-1 text-xs leading-5 text-[#756b67]">
                    {testimonial.location}
                    <span aria-hidden="true" className="mx-1.5 text-champagne">
                      ·
                    </span>
                    {testimonial.date}
                  </p>
                </footer>
              </blockquote>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
