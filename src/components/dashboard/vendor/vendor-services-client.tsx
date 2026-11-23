"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Eye,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/layout/toast-provider";
import {
  deleteVendorService,
  getVendorServicesPage,
  setVendorServiceActive,
  type VendorServiceQuery,
} from "@/lib/vendor-api";
import { SERVICE_CATEGORIES } from "@/lib/services-api";
import type { PaginationMeta, VendorService } from "@/lib/vendor-dashboard";
import {
  formatApprovalLabel,
  formatEventDate,
  formatVendorPrice,
} from "@/lib/vendor-dashboard";

type VendorServicesClientProps = {
  activeServices: number | null;
};

export default function VendorServicesClient({
  activeServices,
}: VendorServicesClientProps) {
  const { showToast } = useToast();
  const [query, setQuery] = useState<VendorServiceQuery>({
    q: "",
    category: undefined,
    approvalStatus: undefined,
    isActive: "all",
    page: 1,
    limit: 10,
  });
  const [services, setServices] = useState<VendorService[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getVendorServicesPage(query, signal);
      setServices(result.items);
      setMeta(result.meta);
    } catch (loadError) {
      if (signal?.aborted) return;
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load services."
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      void load(controller.signal);
    });
    return () => controller.abort();
  }, [load]);

  function updateQuery(patch: Partial<VendorServiceQuery>) {
    setQuery((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  }

  async function toggleActive(service: VendorService) {
    setBusyId(service.id);
    try {
      const updated = await setVendorServiceActive(service.id, !service.isActive);
      setServices((current) =>
        current.map((item) => (item.id === service.id ? updated : item))
      );
      showToast({
        title: updated.isActive ? "Service activated" : "Service deactivated",
        description: updated.title,
      });
    } catch (toggleError) {
      showToast({
        title: "Unable to update service",
        description:
          toggleError instanceof Error ? toggleError.message : undefined,
        variant: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(service: VendorService) {
    if (!window.confirm(`Delete "${service.title}"? This cannot be undone.`)) return;
    setBusyId(service.id);
    try {
      await deleteVendorService(service.id);
      setServices((current) => current.filter((item) => item.id !== service.id));
      showToast({ title: "Service deleted", description: service.title });
      void load();
    } catch (deleteError) {
      showToast({
        title: "Unable to delete service",
        description:
          deleteError instanceof Error ? deleteError.message : undefined,
        variant: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl text-foreground">Your listings</h2>
          <p className="mt-1 text-xs text-muted">
            {activeServices === null
              ? "Loading your active service count…"
              : `${activeServices} active ${activeServices === 1 ? "service" : "services"} on your account.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted transition hover:text-primary"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <Link
            href="/dashboard/vendor/services/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white"
          >
            <Plus size={14} /> Add service
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={query.q ?? ""}
          onChange={(event) => updateQuery({ q: event.target.value })}
          placeholder="Search your services"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <select
          value={query.category ?? ""}
          onChange={(event) =>
            updateQuery({ category: event.target.value || undefined })
          }
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">All categories</option>
          {SERVICE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={query.approvalStatus ?? ""}
          onChange={(event) =>
            updateQuery({
              approvalStatus:
                (event.target.value as VendorServiceQuery["approvalStatus"]) ||
                undefined,
            })
          }
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">All approval states</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={query.isActive ?? "all"}
          onChange={(event) =>
            updateQuery({
              isActive: event.target.value as VendorServiceQuery["isActive"],
            })
          }
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="all">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 px-3.5 py-3 text-xs text-error"
        >
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted">
          <Loader2 size={16} className="animate-spin" /> Loading services…
        </p>
      ) : services.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          No services match these filters. Add your first listing to get started.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-220 text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2">Service</th>
                <th className="py-2">Category</th>
                <th className="py-2">Price</th>
                <th className="py-2">Location</th>
                <th className="py-2">Created</th>
                <th className="py-2">Approval</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-border/60">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {service.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={service.images[0]}
                          alt=""
                          className="h-12 w-16 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-secondary text-[10px] text-muted">
                          No image
                        </span>
                      )}
                      <p className="font-semibold text-foreground">{service.title}</p>
                    </div>
                    {service.rejectionReason && (
                      <p className="mt-1 text-xs text-error">
                        Reason: {service.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="py-3 text-muted">{service.category}</td>
                  <td className="py-3 text-muted">
                    {formatVendorPrice(service.price)}
                  </td>
                  <td className="py-3 text-muted">{service.location}</td>
                  <td className="py-3 text-muted">
                    {formatEventDate(service.createdAt)}
                  </td>
                  <td className="py-3">
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs text-primary">
                      {formatApprovalLabel(service.approvalStatus)}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        service.isActive
                          ? "bg-success/15 text-success"
                          : "bg-muted/15 text-muted"
                      }`}
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={
                          service.approvalStatus === "approved" && service.isActive
                            ? `/services/${service.id}`
                            : `/dashboard/vendor/services/${service.id}`
                        }
                        aria-label={`View ${service.title}`}
                        className="rounded-lg border border-border p-2 text-muted transition hover:text-primary"
                      >
                        <Eye size={15} />
                      </Link>
                      <Link
                        href={`/dashboard/vendor/services/${service.id}`}
                        aria-label={`Edit ${service.title}`}
                        className="rounded-lg border border-border p-2 text-muted transition hover:text-primary"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        type="button"
                        disabled={busyId === service.id}
                        onClick={() => void toggleActive(service)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted transition hover:text-primary disabled:opacity-60"
                      >
                        {service.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === service.id}
                        onClick={() => void remove(service)}
                        aria-label={`Delete ${service.title}`}
                        className="rounded-lg border border-error/30 p-2 text-error transition hover:bg-error/10 disabled:opacity-60"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-xs text-muted">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} services
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!meta.hasPreviousPage}
              onClick={() => updateQuery({ page: meta.page - 1 })}
              className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!meta.hasNextPage}
              onClick={() => updateQuery({ page: meta.page + 1 })}
              className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
