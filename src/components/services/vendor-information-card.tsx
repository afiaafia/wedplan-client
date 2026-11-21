"use client";

import { useState } from "react";
import { BadgeCheck, Store } from "lucide-react";
import { getInitials } from "@/lib/vendor-dashboard";
import type { ServiceVendor } from "@/lib/services-api";

export default function VendorInformationCard({
  vendor,
}: {
  vendor?: ServiceVendor | null;
}) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const displayName = vendor?.businessName?.trim() || vendor?.name?.trim();
  const label = vendor?.businessName?.trim()
    ? "Business"
    : vendor?.name?.trim()
      ? "Service provider"
      : "Service provider";

  return (
    <section className="rounded-[28px] border border-border/80 bg-card/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
      <div className="flex items-center gap-2">
        <Store size={17} className="text-accent" />
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne">
          Meet the vendor
        </h2>
      </div>

      <div className="mt-5 flex items-center gap-4">
        {vendor?.profileImage && !avatarFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vendor.profileImage}
            alt={displayName || "Vendor profile"}
            loading="lazy"
            onError={() => setAvatarFailed(true)}
            className="h-14 w-14 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary font-serif text-lg text-primary"
          >
            {getInitials(displayName)}
          </span>
        )}

        <div className="min-w-0">
          <p className="truncate font-serif text-xl text-foreground">
            {displayName || "Vendor information unavailable"}
          </p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-muted">
            {label}
          </p>
        </div>
      </div>

      {vendor?.name?.trim() && vendor.businessName?.trim() && (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted">
          <BadgeCheck size={15} className="shrink-0 text-success" />
          Operated by {vendor.name.trim()}
        </p>
      )}

      <p className="mt-4 text-xs leading-5 text-muted">
        Contact details are shared by the vendor after your booking request is
        received.
      </p>
    </section>
  );
}
