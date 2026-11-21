"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import {
  getAdminTransactions,
  type AdminTransaction,
} from "@/lib/admin-api";
import type { PaginationMeta } from "@/lib/vendor-dashboard";

const STATUS_OPTIONS = ["all", "pending", "completed", "failed", "cancelled", "refunded"];

const EMPTY_META: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AdminTransactions() {
  const [items, setItems] = useState<AdminTransaction[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const result = await getAdminTransactions(
          {
            page,
            limit: 10,
            ...(status !== "all" ? { status } : {}),
            ...(search ? { q: search } : {}),
          },
          signal
        );
        if (!signal?.aborted) {
          setItems(result.items);
          setMeta(result.meta);
          setError(null);
        }
      } catch (loadError) {
        if (!signal?.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load transactions."
          );
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [page, search, status]
  );

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) void load(controller.signal);
    });
    return () => controller.abort();
  }, [load]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <section className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl text-foreground">Transactions</h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            Verified payment records from Stripe webhooks. Statuses are read-only.
          </p>
        </div>

        <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Vendor
            <span className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
              <Search size={14} />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Name or email"
                className="w-36 bg-transparent text-xs text-foreground outline-none placeholder:text-muted"
              />
            </span>
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Status
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="rounded-full border border-border bg-background px-3 py-2 text-xs text-foreground outline-none"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All statuses" : option}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Apply
          </button>
        </form>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-xl border border-error/30 bg-error/10 px-3.5 py-3 text-xs text-error"
        >
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p className="mt-5 flex items-center gap-2 text-sm text-muted">
          <Loader2 size={16} className="animate-spin" /> Loading transactions…
        </p>
      ) : items.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          No transactions match the current filters.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="text-muted">
              <tr className="border-b border-border/70">
                <th className="py-2 font-medium">Vendor</th>
                <th className="py-2 font-medium">Plan</th>
                <th className="py-2 font-medium">Amount</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Stripe reference</th>
              </tr>
            </thead>
            <tbody>
              {items.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-border/40 last:border-0"
                >
                  <td className="py-3">
                    <p className="font-semibold text-foreground">
                      {transaction.vendorName ?? "Unknown vendor"}
                    </p>
                    {transaction.vendorEmail && (
                      <p className="mt-0.5 text-[11px] text-muted">
                        {transaction.vendorEmail}
                      </p>
                    )}
                  </td>
                  <td className="py-3 capitalize text-foreground">
                    {transaction.plan}
                  </td>
                  <td className="py-3 text-foreground">
                    {formatAmount(transaction.amount, transaction.currency)}
                  </td>
                  <td className="py-3">
                    <span className="rounded-full border border-border bg-secondary px-2 py-1 capitalize text-foreground">
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-3 text-foreground">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-muted">
                    {transaction.stripeSessionId ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-xs text-muted">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} transactions
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!meta.hasPreviousPage || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              type="button"
              disabled={!meta.hasNextPage || loading}
              onClick={() => setPage((current) => current + 1)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
