import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "WedPlan for Wedding Vendors",
  description:
    "Learn how wedding professionals can bring their services to WedPlan.",
};

export default function VendorInformationPage() {
  return (
    <main className="min-h-[calc(100vh-72px)] bg-background px-5 pb-20 pt-32 sm:px-8">
      <section
        aria-labelledby="vendor-information-heading"
        className="mx-auto max-w-3xl rounded-[32px] border border-border/80 bg-card px-7 py-10 shadow-[0_20px_70px_rgba(48,39,42,0.08)] sm:px-12 sm:py-14"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne">
          For wedding professionals
        </p>
        <h1
          id="vendor-information-heading"
          className="mt-4 font-serif text-3xl leading-tight tracking-[-0.03em] text-foreground sm:text-4xl"
        >
          Bring your wedding business to WedPlan
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted sm:text-base">
          WedPlan helps wedding professionals showcase their services and manage
          booking requests from couples planning their celebration.
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
          Vendor registration and account activation use WedPlan&apos;s existing
          sign-up and onboarding flows. This information page does not change
          account roles or permissions.
        </p>
        <Link
          href="/services"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md shadow-primary/15 transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Explore Wedding Services
        </Link>
      </section>
    </main>
  );
}
