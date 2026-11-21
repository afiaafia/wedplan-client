"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, ImageOff, Loader2, Pencil, Power } from "lucide-react";
import {
  FREE_PLAN_LIMIT_MESSAGE,
  isActiveServiceLimitReached,
  type VendorPlan,
} from "@/lib/subscription";
import type { VendorApiErrorCode } from "@/lib/vendor-api";
import {
  formatApprovalLabel,
  formatVendorPrice,
  type VendorService,
} from "@/lib/vendor-dashboard";

type VendorServiceRowProps = {
  service: VendorService;
  plan: VendorPlan;
  activeServices: number | null;
  busy: boolean;
  actionError: { message: string; code: VendorApiErrorCode } | null;
  onToggleActive: (service: VendorService) => void;
};

export default function VendorServiceRow({
  service,
  plan,
  activeServices,
  busy,
  actionError,
  onToggleActive,
}: VendorServiceRowProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const canViewPublic = service.approvalStatus === "approved" && service.isActive;
  const image = service.images[0];
  const atLimit = isActiveServiceLimitReached(activeServices, plan);

  const badgeClass =
    service.approvalStatus === "approved"
      ? "border-success/30 bg-success/10 text-success"
      : service.approvalStatus === "pending"
        ? "border-champagne/30 bg-champagne/10 text-champagne"
        : "border-error/30 bg-error/10 text-error";

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center">
      <div className="h-20 w-full shrink-0 overflow-hidden rounded-lg bg-secondary sm:h-16 sm:w-24">
        {image && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            role="img"
            aria-label="No service image available"
            className="flex h-full w-full items-center justify-center text-muted/60"
          >
            <ImageOff size={20} strokeWidth={1.5} />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-serif text-lg text-foreground">
            {service.title}
          </h3>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
            {service.category}
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold text-primary">
          {formatVendorPrice(service.price)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeClass}`}>
          {formatApprovalLabel(service.approvalStatus)}
        </span>
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
            service.isActive
              ? "border-success/30 bg-success/10 text-success"
              : "border-border bg-secondary text-muted"
          }`}
        >
          {service.isActive ? "Active" : "Inactive"}
        </span>

        {canViewPublic ? (
          <Link
            href={`/services/${service.id}`}
            aria-label={`View ${service.title}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary"
          >
            <Eye size={14} />
            View
          </Link>
        ) : (
          <button
            type="button"
            disabled
            title="Public view is available after approval and activation"
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted opacity-60"
          >
            <Eye size={14} />
            View
          </button>
        )}

        <Link
          href={`/dashboard/vendor?service=${encodeURIComponent(service.id)}`}
          aria-label={`Edit ${service.title}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary"
        >
          <Pencil size={14} />
          Edit
        </Link>

        <button
          type="button"
          onClick={() => onToggleActive(service)}
          disabled={busy}
          aria-busy={busy}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Power size={14} />
          )}
          {service.isActive ? "Deactivate" : "Activate"}
        </button>
      </div>

      {!service.isActive && atLimit && plan === "free" && (
        <p className="rounded-lg border border-champagne/30 bg-champagne/10 px-3 py-2 text-[11px] leading-5 text-champagne sm:col-span-2">
          {FREE_PLAN_LIMIT_MESSAGE}
        </p>
      )}

      {actionError && (
        <p role="alert" className="text-[11px] leading-5 text-error">
          {actionError.message}
          {actionError.code === "UNAUTHORIZED" && (
            <Link
              href="/sign-in?redirect=/dashboard/vendor"
              className="ml-1 font-semibold underline underline-offset-2"
            >
              Sign in again
            </Link>
          )}
        </p>
      )}
    </article>
  );
}
