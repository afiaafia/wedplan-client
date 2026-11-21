"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AtSign, Camera, Heart, Mail, Pin, Users } from "lucide-react";
import { getFooterContact, type SocialLink } from "@/lib/footer-links";

const SOCIAL_ICONS = {
  instagram: Camera,
  facebook: Users,
  pinterest: Pin,
  x: AtSign,
} as const;

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
  { label: "Why WedPlan", href: "/#why-choose-heading" },
  { label: "How It Works", href: "/#how-it-works-heading" },
];

const accountLinks = [
  { label: "Sign In", href: "/sign-in" },
  { label: "Create Account", href: "/sign-up" },
  { label: "My Dashboard", href: "/dashboard" },
  { label: "Join as a Vendor", href: "/sign-up?role=vendor" },
];

export default function Footer() {
  const { email, socials } = getFooterContact();
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    queueMicrotask(() => setYear(new Date().getFullYear()));
  }, []);

  return (
    <footer className="border-t border-border bg-secondary/40 px-4 pb-8 pt-14 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1380px]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] lg:gap-12">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                <Heart size={19} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                WedPlan<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-7 text-muted">
              A calmer way to discover wedding services, explore talented
              providers and bring the details of your celebration together.
            </p>
          </div>

          <FooterColumn title="Explore" links={exploreLinks} />
          <FooterColumn title="Your account" links={accountLinks} />

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
              Get in touch
            </h2>
            <div className="mt-4 space-y-3 text-sm text-muted">
              {email ? (
                <a
                  href={email}
                  className="inline-flex items-center gap-2 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <Mail size={15} className="text-accent" aria-hidden="true" />
                  <span className="break-all">{email.replace("mailto:", "")}</span>
                </a>
              ) : (
                <p>Contact details are available from your WedPlan administrator.</p>
              )}

              {socials.length > 0 && (
                <ul className="flex flex-wrap gap-2 pt-1">
                  {socials.map((social) => (
                    <li key={social.label}>
                      <SocialAnchor social={social} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year ?? "\u00a0"} WedPlan. All rights reserved.</p>
          <p>Made for your moment.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialAnchor({ social }: { social: SocialLink }) {
  const Icon = SOCIAL_ICONS[social.icon];

  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.label}
      title={social.label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <Icon size={16} aria-hidden="true" />
    </a>
  );
}
