"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Loader2,
  RefreshCw,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import {
  deleteAdminService,
  getAdminServices,
  setAdminServiceActive,
  setAdminServiceApproval,
  type AdminService,
} from "@/lib/admin-api";
import { SERVICE_CATEGORIES } from "@/lib/services-api";
import type { VendorService } from "@/lib/vendor-dashboard";
import { formatEventDate, formatVendorPrice } from "@/lib/vendor-dashboard";
import { useToast } from "@/components/layout/toast-provider";

const PAGE_SIZE = 10;

export default function AdminServicesClient() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [vendor, setVendor] = useState("");
  const [approval, setApproval] = useState("");
  const [active, setActive] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [services, setServices] = useState<AdminService[]>([]);
  const [meta, setMeta] = useState<{ page: number; totalPages: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminService | null>(null);
  const [rejection, setRejection] = useState<AdminService | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAdminServices(
          {
            q: search.trim() || undefined,
            vendor: vendor.trim() || undefined,
            approvalStatus: approval || undefined,
            isActive: active || undefined,
            category: category || undefined,
            page,
            limit: PAGE_SIZE,
          },
          signal
        );
        if (signal?.aborted) return;
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
    },
    [active, approval, category, page, search, vendor]
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => void load(controller.signal),
      search ? 300 : 0
    );
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [load, nonce, search]);

  useEffect(() => {
    queueMicrotask(() => setPage(1));
  }, [search, vendor, approval, active, category]);

  useEffect(() => {
    if (!detail && !rejection) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setDetail(null);
      setRejection(null);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [detail, rejection]);

  function mergeUpdatedService(
    existing: AdminService,
    updated: VendorService
  ): AdminService {
    return {
      ...existing,
      ...updated,
      ...(existing.vendorId ? { vendorId: existing.vendorId } : {}),
      ...(existing.vendorName ? { vendorName: existing.vendorName } : {}),
      ...(existing.vendorEmail ? { vendorEmail: existing.vendorEmail } : {}),
    };
  }

  async function moderate(service: VendorService, next: "approved" | "rejected") {
    if (next === "rejected") {
      setRejectionReason("");
      setRejection(service);
      return;
    }

    await executeModeration(service, next);
  }

  async function executeModeration(
    service: VendorService,
    next: "approved" | "rejected",
    reason?: string
  ) {
    if (
      !window.confirm(
        `Are you sure you want to ${next} "${service.title}"? ${
          next === "approved"
            ? "It will become publicly visible if the vendor has enabled it."
            : "The vendor will be asked to revise and resubmit."
        }`
      )
    ) {
      return;
    }

    setBusyId(service.id);
    try {
      const updated = await setAdminServiceApproval(service.id, next, reason);
      setServices((current: AdminService[]) =>
        current.map((item: AdminService) =>
          item.id === updated.id ? mergeUpdatedService(item, updated) : item
        )
      );
      setDetail((current: AdminService | null) =>
        current?.id === updated.id
          ? mergeUpdatedService(current, updated)
          : current
      );
      if (next === "rejected") setRejection(null);
      showToast({
        title: next === "approved" ? "Service approved" : "Service rejected",
        description: service.title,
      });
      setNonce((value) => value + 1);
    } catch (moderateError) {
      showToast({
        title: "Action failed",
        description:
          moderateError instanceof Error
            ? moderateError.message
            : "Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(service: VendorService) {
    const next = !service.isActive;
    if (
      !window.confirm(
        `Are you sure you want to ${next ? "activate" : "deactivate"} "${service.title}"?`
      )
    ) {
      return;
    }

    setBusyId(service.id);
    try {
      const updated = await setAdminServiceActive(service.id, next);
      setServices((current: AdminService[]) =>
        current.map((item: AdminService) =>
          item.id === updated.id ? mergeUpdatedService(item, updated) : item
        )
      );
      setDetail((current: AdminService | null) =>
        current?.id === updated.id
          ? mergeUpdatedService(current, updated)
          : current
      );
      showToast({
        title: next ? "Service activated" : "Service deactivated",
        description: service.title,
      });
    } catch (activeError) {
      showToast({
        title: "Action failed",
        description:
          activeError instanceof Error ? activeError.message : "Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(service: VendorService) {
    if (
      !window.confirm(
        `Permanently delete "${service.title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setBusyId(service.id);
    try {
      await deleteAdminService(service.id);
      setServices((current: AdminService[]) =>
        current.filter((item: AdminService) => item.id !== service.id)
      );
      setDetail(null);
      showToast({ title: "Service deleted", description: service.title });
      setNonce((value) => value + 1);
    } catch (deleteError) {
      showToast({
        title: "Delete failed",
        description:
          deleteError instanceof Error ? deleteError.message : "Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search services"
          aria-label="Search services"
          className="w-full min-w-0 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary sm:min-w-[220px] sm:flex-1"
        />
        <input
          type="search"
          value={vendor}
          onChange={(event) => setVendor(event.target.value)}
          placeholder="Vendor name or email"
          aria-label="Filter by vendor name or email"
          className="w-full min-w-0 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary sm:min-w-[200px] sm:flex-1"
        />
        <select
          value={approval}
          onChange={(event) => setApproval(event.target.value)}
          aria-label="Filter by approval status"
          className="w-full min-w-0 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary sm:w-auto"
        >
          <option value="">All approvals</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={active}
          onChange={(event) => setActive(event.target.value)}
          aria-label="Filter by availability"
          className="w-full min-w-0 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary sm:w-auto"
        >
          <option value="">All availability</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
          className="w-full min-w-0 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary sm:w-auto"
        >
          <option value="">All categories</option>
          {SERVICE_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setNonce((value) => value + 1)}
          aria-label="Refresh services"
          className="flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-xl border border-border text-muted transition hover:text-primary sm:self-auto"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-card/80">
        {loading && services.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" /> Loading services...
          </div>
        ) : services.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-muted">
            No services match these filters.
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Approval</th>
                  <th className="px-4 py-3">Availability</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b border-border/60">
                    <td className="px-4 py-3">
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
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {service.title}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {service.location}
                          </p>
                        </div>
                      </div>
                      {service.rejectionReason && (
                        <p className="mt-1 text-xs text-error">
                          Reason: {service.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      <p className="font-medium text-foreground">
                        {service.vendorName || "Vendor"}
                      </p>
                      {service.vendorEmail && (
                        <p className="text-xs">{service.vendorEmail}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{service.category}</td>
                    <td className="px-4 py-3 text-muted">
                      {formatVendorPrice(service.price)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatEventDate(service.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          service.approvalStatus === "approved"
                            ? "bg-success/15 text-success"
                            : service.approvalStatus === "pending"
                              ? "bg-accent/15 text-accent"
                              : "bg-error/15 text-error"
                        }`}
                      >
                        {service.approvalStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          service.isActive
                            ? "bg-success/15 text-success"
                            : "bg-muted/15 text-muted"
                        }`}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setDetail(service)}
                          aria-label={`View ${service.title}`}
                          className="rounded-lg border border-border p-2 text-muted transition hover:text-primary"
                        >
                          <Eye size={15} />
                        </button>
                        {service.approvalStatus === "pending" && (
                          <>
                            <button
                              type="button"
                              disabled={busyId === service.id}
                              onClick={() => void moderate(service, "approved")}
                              aria-label={`Approve ${service.title}`}
                              className="rounded-lg border border-success/30 p-2 text-success transition hover:bg-success/10 disabled:opacity-60"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                            <button
                              type="button"
                              disabled={busyId === service.id}
                              onClick={() => void moderate(service, "rejected")}
                              aria-label={`Reject ${service.title}`}
                              className="rounded-lg border border-error/30 p-2 text-error transition hover:bg-error/10 disabled:opacity-60"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
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
            <div className="space-y-3 p-3 lg:hidden">
              {services.map((service) => (
                <article
                  key={service.id}
                  className="rounded-xl border border-border/70 bg-background/60 p-4"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    {service.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={service.images[0]}
                        alt=""
                        className="h-16 w-20 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-secondary text-[10px] text-muted">
                        No image
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="break-words font-semibold text-foreground">
                        {service.title}
                      </h2>
                      <p className="mt-1 break-words text-xs text-muted">
                        {service.location}
                      </p>
                      <p className="mt-1 break-words text-xs text-muted">
                        {service.vendorName || "Vendor"}
                        {service.vendorEmail ? ` · ${service.vendorEmail}` : ""}
                      </p>
                    </div>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-xs">
                    <div className="min-w-0">
                      <dt className="text-muted">Category</dt>
                      <dd className="mt-1 break-words font-medium text-foreground">{service.category}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-muted">Price</dt>
                      <dd className="mt-1 break-words font-medium text-foreground">{formatVendorPrice(service.price)}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-muted">Submitted</dt>
                      <dd className="mt-1 break-words font-medium text-foreground">{formatEventDate(service.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Approval</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          service.approvalStatus === "approved"
                            ? "bg-success/15 text-success"
                            : service.approvalStatus === "pending"
                              ? "bg-accent/15 text-accent"
                              : "bg-error/15 text-error"
                        }`}>{service.approvalStatus}</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">Availability</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          service.isActive ? "bg-success/15 text-success" : "bg-muted/15 text-muted"
                        }`}>{service.isActive ? "Active" : "Inactive"}</span>
                      </dd>
                    </div>
                  </dl>
                  {service.rejectionReason && (
                    <p className="mt-3 break-words text-xs text-error">
                      Reason: {service.rejectionReason}
                    </p>
                  )}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDetail(service)}
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-muted transition hover:text-primary ${
                        service.approvalStatus === "pending" ? "" : "col-span-2"
                      }`}
                    >
                      <Eye size={15} /> Details
                    </button>
                    {service.approvalStatus === "pending" && (
                      <>
                        <button
                          type="button"
                          disabled={busyId === service.id}
                          onClick={() => void moderate(service, "approved")}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-success/30 px-3 text-xs font-semibold text-success transition hover:bg-success/10 disabled:opacity-60"
                        >
                          <CheckCircle2 size={15} /> Approve
                        </button>
                        <button
                          type="button"
                          disabled={busyId === service.id}
                          onClick={() => void moderate(service, "rejected")}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-error/30 px-3 text-xs font-semibold text-error transition hover:bg-error/10 disabled:opacity-60"
                        >
                          <XCircle size={15} /> Reject
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      disabled={busyId === service.id}
                      onClick={() => void toggleActive(service)}
                      className="min-h-11 rounded-lg border border-border px-3 text-xs font-semibold text-muted transition hover:text-primary disabled:opacity-60"
                    >
                      {service.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === service.id}
                      onClick={() => void remove(service)}
                      aria-label={`Delete ${service.title}`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-error/30 px-3 text-xs font-semibold text-error transition hover:bg-error/10 disabled:opacity-60"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex flex-col gap-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} services
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="min-h-11 min-w-11 rounded-lg border border-border px-3 py-2 font-semibold disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="min-h-11 min-w-11 rounded-lg border border-border px-3 py-2 font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {rejection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-3 backdrop-blur-sm sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-service-rejection-title"
            className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-border/70 bg-card p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2
                  id="admin-service-rejection-title"
                  className="break-words font-serif text-2xl text-foreground"
                >
                  Reject service
                </h2>
                <p className="mt-1 break-words text-sm text-muted">
                  Add a reason for {rejection.title}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejection(null)}
                aria-label="Close rejection interface"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-secondary"
              >
                <X size={18} />
              </button>
            </div>
            <label
              htmlFor="admin-service-rejection-reason"
              className="mt-5 block text-sm font-semibold text-foreground"
            >
              Rejection reason
            </label>
            <textarea
              id="admin-service-rejection-reason"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              rows={5}
              maxLength={1000}
              placeholder="Explain what the vendor should revise"
              className="mt-2 min-h-32 w-full resize-y rounded-xl border border-border bg-background px-3.5 py-3 text-sm text-foreground outline-none focus:border-primary"
            />
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRejection(null)}
                className="min-h-11 rounded-full border border-border px-4 text-sm font-semibold text-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  void executeModeration(
                    rejection,
                    "rejected",
                    rejectionReason.trim() || undefined
                  )
                }
                className="min-h-11 rounded-full bg-error px-4 text-sm font-semibold text-white"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-3 backdrop-blur-sm sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-service-detail-title"
            className="max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-border/70 bg-card p-5 shadow-xl sm:max-h-[90vh] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2
                  id="admin-service-detail-title"
                  className="break-words font-serif text-2xl text-foreground"
                >
                  {detail.title}
                </h2>
                <p className="mt-1 break-words text-xs text-muted">
                  {detail.category} · {detail.location} ·{" "}
                  {formatVendorPrice(detail.price)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                aria-label="Close service details"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-secondary"
              >
                <X size={18} />
              </button>
            </div>
            {detail.images.length > 0 && (
              <div className="mt-5 flex gap-2 overflow-x-auto">
                {detail.images.map((image: string) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={image}
                    src={image}
                    alt=""
                    className="h-24 w-32 shrink-0 rounded-xl object-cover"
                  />
                ))}
              </div>
            )}
            <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-muted">
              {detail.description}
            </p>
            <dl className="mt-5 space-y-2 border-t border-border/70 pt-4 text-sm">
              <DetailRow label="Vendor" value={detail.vendorName || "Vendor"} />
              <DetailRow
                label="Vendor email"
                value={detail.vendorEmail || "Not available"}
              />
              <DetailRow label="Approval" value={detail.approvalStatus} />
              <DetailRow
                label="Availability"
                value={detail.isActive ? "Active" : "Inactive"}
              />
              <DetailRow
                label="Submitted"
                value={formatEventDate(detail.createdAt)}
              />
              <DetailRow
                label="Last updated"
                value={formatEventDate(detail.updatedAt)}
              />
              {detail.rejectionReason && (
                <DetailRow label="Rejection reason" value={detail.rejectionReason} />
              )}
            </dl>
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="mt-6 min-h-11 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium capitalize text-foreground">{value}</dd>
    </div>
  );
}
