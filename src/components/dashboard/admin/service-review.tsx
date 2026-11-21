"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2, RotateCcw, X } from "lucide-react";
import {
  getServicesForReview,
  setServiceApproval,
  type AdminApprovalStatus,
} from "@/lib/admin-services-api";
import { formatPrice } from "@/lib/services-api";
import type { VendorService } from "@/lib/vendor-dashboard";

export default function ServiceReview() {
  const router = useRouter();
  const [services, setServices] = useState<VendorService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getServicesForReview()
      .then((data) => {
        if (!active) return;
        setServices(data);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load services for review."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function update(id: string, approvalStatus: AdminApprovalStatus) {
    setUpdatingId(id);
    setError(null);
    try {
      const updated = await setServiceApproval(id, approvalStatus);
      setServices((current) =>
        current.map((service) => (service.id === id ? updated : service))
      );
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update the approval status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm">
      <div>
        <h2 className="font-serif text-xl text-foreground">Service approvals</h2>
        <p className="mt-1 text-xs leading-5 text-muted">
          Approve real vendor listings before they can appear on the homepage.
          Approval never changes ownership or activation status.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-error/30 bg-error/10 px-3.5 py-3 text-xs text-error"
        >
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p className="mt-5 flex items-center gap-2 text-sm text-muted">
          <Loader2 size={16} className="animate-spin" />
          Loading services…
        </p>
      ) : services.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
          No services have been submitted yet.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {services.map((service) => (
            <li
              key={service.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border/70 bg-background/60 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{service.title}</p>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {service.approvalStatus}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-muted">
                    {service.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {service.category} · {service.location} ·{" "}
                  {formatPrice(service.price)}
                </p>
                {service.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={service.images[0]}
                    alt=""
                    loading="lazy"
                    className="mt-3 h-16 w-24 rounded-lg object-cover"
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={updatingId === service.id}
                  onClick={() => update(service.id, "approved")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                >
                  <Check size={14} /> Approve
                </button>
                <button
                  type="button"
                  disabled={updatingId === service.id}
                  onClick={() => update(service.id, "rejected")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-error/40 px-3 py-1.5 text-xs font-semibold text-error disabled:opacity-60"
                >
                  <X size={14} /> Reject
                </button>
                {service.approvalStatus !== "pending" && (
                  <button
                    type="button"
                    disabled={updatingId === service.id}
                    onClick={() => update(service.id, "pending")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted disabled:opacity-60"
                  >
                    <RotateCcw size={13} /> Pending
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
