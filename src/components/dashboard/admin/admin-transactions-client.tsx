"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Eye, Loader2, RefreshCw, X } from "lucide-react";
import {
  getAdminTransactions,
  type AdminTransaction,
} from "@/lib/admin-api";
import {
  formatCurrencyAmount,
  formatEventDate,
} from "@/lib/vendor-dashboard";

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
  const [detail, setDetail] = useState<AdminTransaction | null>(null);

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
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search transactions"
          aria-label="Search transactions"
          className="w-full min-w-0 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary sm:min-w-55 sm:flex-1"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by transaction status"
          className="w-full min-w-0 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary sm:w-auto"
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
          className="w-full min-w-0 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary sm:w-48"
        />
        <button
          type="button"
          onClick={() => setNonce((value) => value + 1)}
          aria-label="Refresh transactions"
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
        {loading && transactions.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" /> Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-muted">
            No transactions match these filters.
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-295 text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Transaction</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3 text-right">Details</th>
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
                      {formatCurrencyAmount(transaction.amount, transaction.currency)}
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
                    <td className="px-4 py-3 capitalize text-muted">
                      {transaction.provider}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatEventDate(transaction.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {transaction.stripeSessionId
                        ? `${transaction.stripeSessionId.slice(0, 12)}…`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDetail(transaction)}
                        aria-label={`View transaction ${transaction.id}`}
                        className="rounded-lg border border-border p-2 text-muted transition hover:text-primary"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="space-y-3 p-3 lg:hidden">
              {transactions.map((transaction) => (
                <article
                  key={transaction.id}
                  className="rounded-xl border border-border/70 bg-background/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-muted">Transaction</p>
                      <p className="mt-1 break-all font-mono text-sm font-semibold text-foreground">
                        {transaction.id.slice(-12)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
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
                  </div>
                  <p className="mt-3 wrap-break-word font-medium text-foreground">
                    {transaction.vendorName || "Vendor"}
                  </p>
                  <p className="break-all text-xs text-muted">{transaction.vendorEmail || ""}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-xs">
                    <div className="min-w-0">
                      <dt className="text-muted">Plan</dt>
                      <dd className="mt-1 wrap-break-word font-medium capitalize text-foreground">{transaction.plan}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-muted">Amount</dt>
                      <dd className="mt-1 wrap-break-word font-semibold text-foreground">
                        {formatCurrencyAmount(transaction.amount, transaction.currency)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-muted">Provider</dt>
                      <dd className="mt-1 wrap-break-word font-medium capitalize text-foreground">{transaction.provider}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-muted">Date</dt>
                      <dd className="mt-1 wrap-break-word font-medium text-foreground">{formatEventDate(transaction.createdAt)}</dd>
                    </div>
                    <div className="col-span-2 min-w-0">
                      <dt className="text-muted">Reference</dt>
                      <dd className="mt-1 break-all font-mono text-foreground">
                        {transaction.stripeSessionId || "—"}
                      </dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => setDetail(transaction)}
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm font-semibold text-muted transition hover:text-primary"
                  >
                    <Eye size={16} /> View transaction details
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex flex-col gap-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} transactions
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

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-3 backdrop-blur-sm sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-transaction-detail-title"
            className="max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-border/70 bg-card p-5 shadow-xl sm:max-h-[90vh] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2
                  id="admin-transaction-detail-title"
                  className="wrap-break-word font-serif text-2xl text-foreground"
                >
                  Transaction details
                </h2>
                <p className="mt-1 break-all font-mono text-xs text-muted">
                  {detail.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                aria-label="Close transaction details"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-secondary"
              >
                <X size={18} />
              </button>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <DetailRow
                label="Vendor"
                value={detail.vendorName || "Vendor"}
              />
              {detail.vendorEmail && (
                <DetailRow label="Vendor email" value={detail.vendorEmail} />
              )}
              <DetailRow label="Plan" value={detail.plan} />
              <DetailRow
                label="Amount"
                value={formatCurrencyAmount(detail.amount, detail.currency)}
              />
              <DetailRow label="Status" value={detail.status} />
              <DetailRow
                label="Payment provider"
                value={detail.provider}
              />
              <DetailRow
                label="Transaction date"
                value={formatEventDate(detail.createdAt)}
              />
              <DetailRow
                label="Stripe Checkout session"
                value={detail.stripeSessionId || "Not available"}
              />
              <DetailRow
                label="Stripe subscription"
                value={detail.stripeSubscriptionId || "Not available"}
              />
            </dl>
            <p className="mt-5 rounded-xl bg-secondary/60 p-3 text-xs leading-5 text-muted">
              Transaction status is read-only and is updated only by verified payment events.
            </p>
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="mt-5 min-h-11 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Close
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-2 last:border-0">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="break-all text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
