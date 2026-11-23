import HeroContent from "./hero-content";
import HeroCarousel from "./hero-carousel";

export default function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-background pb-10 pt-24 sm:pb-16 sm:pt-28 lg:pb-24 lg:pt-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-24 h-105 w-105 rounded-full bg-[#F1E4DE]/70 blur-[110px] dark:bg-primary/5"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 h-90 w-90 rounded-full bg-champagne/10 blur-[100px]"
      />

      <div className="relative mx-auto grid w-full max-w-345 grid-cols-1 items-center gap-6 px-4 sm:gap-8 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14 lg:px-14">
        <HeroContent />
        <HeroCarousel />
      </div>
    </section>
  );
}
