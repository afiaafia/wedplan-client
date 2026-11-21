"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import {
  getAdminTransactions,
  type AdminTransaction,
} from "@/lib/admin-api";
import { formatEventDate } from "@/lib/vendor-dashboard";

const PAGE_SIZE = 10;

const TRANSACTION_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

export default function AdminTransactionsClient() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [meta, setMeta] = useState<{ page: number; totalPages: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAdminTransactions(
          {
            q: search.trim() || undefined,
            status: status || undefined,
            vendorId: vendorId || undefined,
            page,
            limit: PAGE_SIZE,
          },
          signal
        );
        if (signal?.aborted) return;
        setTransactions(result.items);
        setMeta(result.meta);
      } catch (loadError) {
        if (signal?.aborted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load transactions."
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [page, search, status, vendorId]
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
  }, [search, status, vendorId]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card/80 p-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search transactions"
          aria-label="Search transactions"
          className="min-w-[220px] flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by transaction status"
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="">All statuses</option>
          {TRANSACTION_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <input
          value={vendorId}
          onChange={(event) => setVendorId(event.target.value)}
          placeholder="Vendor ID"
          aria-label="Filter by vendor ID"
          className="w-48 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => setNonce((value) => value + 1)}
          aria-label="Refresh transactions"
          className="rounded-xl border border-border p-2.5 text-muted transition hover:text-primary"
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

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80">
        {loading && transactions.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" /> Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-muted">
            No transactions match these filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Transaction</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Reference</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border/60">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      {transaction.id.slice(-12)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {transaction.vendorName || "Vendor"}
                      </p>
                      <p className="text-xs text-muted">{transaction.vendorEmail || ""}</p>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted">
                      {transaction.plan}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {transaction.currency.toUpperCase()} {transaction.amount}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          transaction.status === "completed"
                            ? "bg-success/15 text-success"
                            : transaction.status === "failed" ||
                                transaction.status === "cancelled" ||
                                transaction.status === "refunded"
                              ? "bg-error/15 text-error"
                              : "bg-accent/15 text-accent"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatEventDate(transaction.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {transaction.stripeSessionId
                        ? `${transaction.stripeSessionId.slice(0, 12)}…`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} transactions
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-border px-3 py-1.5 font-semibold disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-border px-3 py-1.5 font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted">
        Transaction statuses are recorded by the payment webhook and are read-only.
      </p>
    </div>
  );
}
