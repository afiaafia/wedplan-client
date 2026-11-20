import HeroContent from "./hero-content";
import HeroImage from "./hero-image";

export default function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-background pb-20 pt-32 sm:pb-24 sm:pt-36 lg:pb-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-24 h-[420px] w-[420px] rounded-full bg-[#F1E4DE]/70 blur-[110px] dark:bg-primary/5"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 h-[360px] w-[360px] rounded-full bg-champagne/10 blur-[100px]"
      />

      <div className="relative mx-auto grid max-w-[1380px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 lg:px-14">
        <HeroContent />
        <HeroImage />
      </div>
    </section>
  );
}
