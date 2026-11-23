import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Camera,
  Flower2,
  Heart,
  LogIn,
  Mail,
  Search,
  Shirt,
  Sparkles,
  Utensils,
  UserPlus,
  LayoutDashboard,
  House,
} from "lucide-react";

import { getFooterContact } from "@/lib/footer-links";

const navigationLinks = [
  { label: "Home", href: "/", icon: House },
  { label: "Browse Services", href: "/services", icon: Search },
  { label: "Sign In", href: "/sign-in", icon: LogIn },
  { label: "Create Account", href: "/sign-up", icon: UserPlus },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

const categoryLinks = [
  { label: "Photography & Videography", icon: Camera },
  { label: "Wedding Venues", icon: Building2 },
  { label: "Decoration & Florist", icon: Flower2 },
  { label: "Catering Services", icon: Utensils },
  { label: "Makeup & Styling", icon: Sparkles },
  { label: "Wedding Fashion", icon: Shirt },
];

function SocialOutlineIcon({ name }: { name: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      {...common}
    >
      {name === "instagram" && (
        <>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.7" r="0.7" />
        </>
      )}

      {name === "facebook" && (
        <path d="M14.2 20v-7.3h2.5l.4-3h-2.9V7.8c0-.9.3-1.5 1.5-1.5h1.5V3.6c-.7-.1-1.4-.2-2.2-.2-2.3 0-3.9 1.4-3.9 4v2.3H8.5v3h2.6V20" />
      )}

      {name === "youtube" && (
        <>
          <rect x="2.8" y="5.5" width="18.4" height="13" rx="4" />
          <path d="m10 9 5 3-5 3z" />
        </>
      )}

      {name === "x" && (
        <>
          <path d="M4 3.5 20 20.5" />
          <path d="M20 3.5 4 20.5" />
          <path d="M4 3.5h4l12 17h-4z" />
        </>
      )}

      {name === "pinterest" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M10 20.5 12.2 13c-.5-1-.6-2.2.1-3.2.8-1.2 2.5-1.5 3.5-.6 1.1 1 .8 2.8-.1 4-.8 1.1-2.2 1.5-3.3.9" />
          <path d="M9.6 15.7c-.4-.9-.5-2-.2-3.1" />
        </>
      )}

      {name === "tiktok" && (
        <>
          <path d="M14 3.5v11.2a3.5 3.5 0 1 1-3-3.5" />
          <path d="M14 3.5c.4 2.5 2 4.1 4.5 4.5" />
        </>
      )}
    </svg>
  );
}

function FooterLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof Heart;
}) {
  return (
    <Link
      href={href}
      className="group flex w-full min-w-0 items-center gap-2 rounded-lg py-1 text-xs text-muted transition-all duration-300 hover:translate-x-1 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-fit sm:gap-2.5 sm:py-1.5 sm:text-sm"
    >
      <Icon
        size={14}
        strokeWidth={1.7}
        className="h-3.5 w-3.5 shrink-0 text-primary/65 transition-colors duration-300 group-hover:text-primary sm:h-4 sm:w-4"
        aria-hidden="true"
      />
      <span className="min-w-0 break-words">{label}</span>
    </Link>
  );
}

export default function Footer() {
  const { email, socials } = getFooterContact();

  return (
    <footer className="relative px-3 pb-4 pt-8 sm:px-6 sm:pb-6 sm:pt-12 lg:px-10">
      <div className="mx-auto max-w-[1380px]">
        {/* Main glass capsule */}
        <div className="footer-glass relative overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/65 px-4 py-6 shadow-[0_18px_60px_rgba(74,43,48,0.07)] backdrop-blur-2xl sm:rounded-[2rem] sm:px-8 sm:py-11 lg:px-11">
          {/* Subtle decorative light */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#b89570]/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#75434b]/10 blur-3xl"
          />

          <div className="relative z-10">
            {/* Top brand and CTA */}
            <div className="grid gap-6 border-b border-[#e9e1dc]/80 pb-6 sm:gap-8 sm:pb-9 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
              <div className="max-w-xl">
                <Link
                  href="/"
                  className="group inline-flex items-center gap-3"
                  aria-label="WedPlan home"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/15 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 sm:h-12 sm:w-12 sm:rounded-2xl">
                    <Heart size={20} strokeWidth={1.8} aria-hidden="true" className="sm:h-[23px] sm:w-[23px]" />
                  </span>

                  <span className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    WedPlan<span className="text-primary">.</span>
                  </span>
                </Link>

                <p className="mt-4 max-w-lg text-sm leading-6 text-muted sm:mt-5 sm:text-[15px] sm:leading-7">
                  Discover trusted wedding professionals, explore beautiful
                  services, and bring every detail of your perfect celebration
                  together with confidence.
                </p>

                <p className="mt-2 flex items-center gap-2 text-xs font-medium tracking-wide text-primary/80 sm:mt-3">
                  <Heart size={13} fill="currentColor" aria-hidden="true" />
                  Thoughtfully planned. Beautifully celebrated.
                </p>
              </div>

              {/* CTA */}
              <div className="relative overflow-hidden rounded-[1.25rem] border border-[#e9e1dc]/80 bg-gradient-to-br from-[#f8f3ef]/95 via-[#f4edea]/90 to-[#eee3df]/90 p-4 shadow-inner sm:rounded-[1.5rem] sm:p-7">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full border border-white/70"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-6 h-24 w-24 rounded-full border border-[#b89570]/20"
                />

                <div className="relative">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#b89570]/30 bg-white/55 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary sm:px-3 sm:text-[10px] sm:tracking-[0.18em]">
                    <Sparkles size={12} aria-hidden="true" />
                    Your celebration, your way
                  </span>

                  <h2 className="mt-3 font-serif text-xl font-semibold leading-tight text-foreground sm:mt-4 sm:text-3xl">
                    Your dream wedding
                    <br />
                    starts right here.
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-muted sm:mt-3">
                    Find the right people, discover beautiful services, and
                    make every wedding detail feel effortless.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
                    <Link
                      href="/services"
                      className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#603541] hover:shadow-xl hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      Explore Services
                      <ArrowUpRight
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </Link>

                    <Link
                      href="/sign-up?role=vendor"
                      className="group inline-flex items-center gap-1.5 rounded-full px-3 py-3 text-xs font-semibold text-primary transition-colors duration-300 hover:bg-white/60"
                    >
                      Join as a Vendor
                      <ArrowUpRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer columns */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 py-6 sm:gap-9 sm:py-9 lg:grid-cols-[1fr_1.2fr_1.5fr_1fr] lg:gap-8">
              {/* Navigation */}
              <div>
                <h3 className="font-serif text-base font-semibold text-foreground sm:text-lg">
                  Navigation
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Find your way around
                </p>

                <div className="mt-4 flex flex-col gap-1">
                  {navigationLinks.map((item) => (
                    <FooterLink key={item.label} {...item} />
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-serif text-base font-semibold text-foreground sm:text-lg">
                  Wedding Categories
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Every detail, beautifully covered
                </p>

                <div className="mt-4 flex flex-col gap-1">
                  {categoryLinks.map(({ label, icon: Icon }) => (
                    <Link
                      key={label}
                      href="/services"
                      className="group flex w-full min-w-0 items-center gap-2 rounded-lg py-1 text-xs text-muted transition-all duration-300 hover:translate-x-1 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-fit sm:gap-2.5 sm:py-1.5 sm:text-sm"
                    >
                      <Icon
                        size={14}
                        strokeWidth={1.7}
                        className="h-3.5 w-3.5 shrink-0 text-primary/65 transition-colors duration-300 group-hover:text-primary sm:h-4 sm:w-4"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 break-words">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Contact and social */}
              <div>
                <h3 className="font-serif text-base font-semibold text-foreground sm:text-lg">
                  Contact & Connect
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Stay connected with WedPlan
                </p>

                <div className="mt-4">
                  {email ? (
                    <a
                      href={email}
                      className="group inline-flex max-w-full items-center gap-2 rounded-lg py-1 text-xs text-muted transition-colors duration-300 hover:text-primary sm:gap-2.5 sm:py-1.5 sm:text-sm"
                    >
                      <Mail
                        size={16}
                        className="text-primary/70 transition-colors group-hover:text-primary"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 break-all">{email.replace("mailto:", "")}</span>
                    </a>
                  ) : (
                    <p className="flex items-center gap-2.5 py-1.5 text-sm text-muted">
                      <Mail
                        size={16}
                        className="text-primary/70"
                        aria-hidden="true"
                      />
                      Get in touch with WedPlan
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                    Follow WedPlan
                  </h4>

                  {socials.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {socials.map(({ label, icon, href }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Visit ${label}`}
                          title={label}
                          className="social-glow group relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/80 bg-white/55 text-primary shadow-[0_5px_18px_rgba(74,43,48,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-white/90 hover:text-[#603541] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          <SocialOutlineIcon name={icon} />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 max-w-xs text-xs leading-5 text-muted">
                      Social profile links are not configured yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Brand note */}
              <div>
                <h3 className="font-serif text-base font-semibold text-foreground sm:text-lg">
                  Made for your moment
                </h3>
                <p className="mt-1 text-xs text-muted">
                  A little more joy in every detail
                </p>

                <div className="mt-3 rounded-2xl border border-white/80 bg-white/45 p-3 shadow-sm backdrop-blur-lg sm:mt-4 sm:p-4">
                  <Heart
                    size={20}
                    className="text-primary"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                  <p className="mt-2 font-serif text-sm leading-5 text-foreground sm:mt-3 sm:text-base sm:leading-6">
                    Because every love story deserves a beautiful beginning.
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted">
                    Discover. Connect. Celebrate.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col gap-2 border-t border-[#e9e1dc]/80 pt-4 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-6 sm:text-left">
              <p className="text-xs text-muted">
                © 2026 WedPlan Wedding Planning Platform. All rights reserved.
              </p>

              <p className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-primary/80 sm:justify-end">
                Crafted for couples & wedding professionals
                <Heart
                  size={12}
                  fill="currentColor"
                  aria-hidden="true"
                />
              </p>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}
