"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ImageOff, MapPin, Store } from "lucide-react";
import { formatPrice, type PublicService } from "@/lib/services-api";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ServiceCard({ service }: { service: PublicService }) {
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const image = service.images.find(
    (candidate) =>
      typeof candidate === "string" &&
      candidate.trim().length > 0 &&
      !failedImages.includes(candidate)
  );
  const vendor = service.vendor;
  const vendorName = vendor?.businessName?.trim() || vendor?.name?.trim() || "";
  const showAvatar = Boolean(vendor?.profileImage) && !avatarFailed;
  const detailsHref = `/services/${encodeURIComponent(service.id)}`;

  return (
    <Link
      href={detailsHref}
      aria-label={`View details for ${service.title}`}
      className="group block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_8px_30px_rgba(48,39,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_18px_45px_rgba(48,39,42,0.11)] motion-reduce:hover:translate-y-0">
      <div className="relative aspect-4/3 overflow-hidden bg-secondary">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={service.title}
            loading="lazy"
            onError={() => setFailedImages((current) => [...current, image])}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div
            role="img"
            aria-label="No image available"
            className="flex h-full w-full items-center justify-center text-muted/60"
          >
            <ImageOff size={34} strokeWidth={1.4} aria-hidden="true" />
          </div>
        )}

        <span className="absolute left-4 top-4 max-w-[calc(100%-2rem)] truncate rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary shadow-sm backdrop-blur-sm">
          {service.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 min-w-0 font-serif text-xl leading-snug text-foreground">
            {service.title}
          </h2>
          <span className="shrink-0 whitespace-nowrap pt-1 text-sm font-semibold text-primary">
            {service.price > 0 ? formatPrice(service.price) : "On request"}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
          {service.description}
        </p>

        <div className="mt-4 flex items-center gap-2.5 border-b border-border/70 pb-4">
          {showAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vendor?.profileImage}
              alt=""
              loading="lazy"
              onError={() => setAvatarFailed(true)}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-primary"
            >
              {vendorName ? initials(vendorName) : <Store size={15} />}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted/80">
              Vendor
            </p>
            <p className="truncate text-sm font-medium text-foreground">
              {vendorName || "WedPlan partner"}
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <MapPin size={14} className="shrink-0 text-accent" aria-hidden="true" />
              <span className="truncate">
                {service.location || "Location not specified"}
              </span>
            </p>
            <p className="mt-1.5 text-[11px] uppercase tracking-wide text-muted/80">
              {service.price > 0 ? "Starting price" : "Price on request"}
            </p>
          </div>

          <span
            aria-hidden="true"
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            View Details
            <ArrowUpRight
              size={14}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </div>
      </article>
    </Link>
  );
}
