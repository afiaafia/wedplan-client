"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ImageOff, MapPin } from "lucide-react";
import {
  featuredServiceHref,
  firstAvailableImage,
  type FeaturedService,
} from "@/lib/featured-services-api";
import { formatPrice } from "@/lib/services-api";
import { getInitials } from "@/lib/vendor-dashboard";

export default function FeaturedServiceCard({
  service,
}: {
  service: FeaturedService;
}) {
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const image = firstAvailableImage(service.images, failedImages);
  const showImage = Boolean(image);
  const vendorName =
    service.vendor?.name?.trim() || service.vendor?.businessName?.trim() || "";
  const showAvatar = Boolean(service.vendor?.profileImage) && !avatarFailed;

  return (
    <Link
      href={featuredServiceHref(service.id)}
      aria-label={`View details for ${service.title || "this service"}`}
      className="group block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_8px_30px_rgba(48,39,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_18px_45px_rgba(48,39,42,0.11)]">
      <div className="relative aspect-16/10 overflow-hidden bg-secondary lg:aspect-4/3">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={service.title || "Wedding service"}
            loading="lazy"
            onError={() => {
              if (image) {
                setFailedImages((current) =>
                  current.includes(image) ? current : [...current, image]
                );
              }
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            role="img"
            aria-label="No image available"
            className="flex h-full w-full items-center justify-center text-muted/60"
          >
            <ImageOff size={34} strokeWidth={1.4} />
          </div>
        )}

        <span         className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-primary shadow-sm backdrop-blur-sm lg:left-4 lg:top-4 lg:px-3 lg:py-1.5 lg:text-[10px] lg:tracking-[0.14em]">
          {service.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 lg:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-lg leading-snug text-foreground lg:text-xl">
            {service.title || "Untitled service"}
          </h3>
          {service.price > 0 && (
            <span className="shrink-0 whitespace-nowrap pt-1 text-[13px] font-semibold text-primary lg:text-sm">
              {formatPrice(service.price)}
            </span>
          )}
        </div>

        {service.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
            {service.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2 rounded-xl bg-secondary/60 p-2 lg:mt-4 lg:gap-2.5 lg:p-2.5">
          {showAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={service.vendor?.profileImage}
              alt={vendorName || "Vendor profile"}
              loading="lazy"
              onError={() => setAvatarFailed(true)}
              className="h-8 w-8 shrink-0 rounded-full object-cover lg:h-9 lg:w-9"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white lg:h-9 lg:w-9"
            >
              {getInitials(vendorName || undefined)}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {vendorName || "Vendor information unavailable"}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-muted">
              {service.vendor?.businessName?.trim()
                ? "Business"
                : vendorName
                  ? "Vendor"
                  : "Service provider"}
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/70 pt-4 lg:pt-5">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <MapPin size={14} className="shrink-0 text-accent" />
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
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </div>
      </article>
    </Link>
  );
}
