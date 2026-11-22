"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Eye,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Unlock,
  X,
} from "lucide-react";
import {
  getAdminUser,
  getAdminUsers,
  setAdminUserBlocked,
  type AdminUser,
} from "@/lib/admin-api";
import { formatEventDate, getInitials, type PaginationMeta } from "@/lib/vendor-dashboard";
import { useToast } from "@/components/layout/toast-provider";

const PAGE_SIZE = 10;

export default function AdminUsersClient() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [blocked, setBlocked] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminUser | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAdminUsers(
          {
            q: search.trim() || undefined,
            role: role || undefined,
            blocked: blocked || undefined,
            page,
            limit: PAGE_SIZE,
          },
          signal
        );
        if (signal?.aborted) return;
        setUsers(result.items);
        setMeta(result.meta);
      } catch (loadError) {
        if (signal?.aborted) return;
        setError(
          loadError instanceof Error ? loadError.message : "Unable to load users."
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [blocked, page, role, search]
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
  }, [search, role, blocked]);

  async function openDetail(id: string) {
    setDetailLoading(true);
    try {
      setDetail(await getAdminUser(id));
    } catch (detailError) {
      showToast({
        title: "Unable to load user",
        description:
          detailError instanceof Error
            ? detailError.message
            : "Please try again.",
      });
    } finally {
      setDetailLoading(false);
    }
  }

  async function toggleBlock(user: AdminUser) {
    const next = !user.isBlocked;
    const label = next ? "block" : "unblock";
    if (
      !window.confirm(
        `Are you sure you want to ${label} ${user.name}? ${
          next
            ? "They will be signed out and unable to use WedPlan."
            : "They will regain access immediately."
        }`
      )
    ) {
      return;
    }

    setBusyId(user.id);
    try {
      const updated = await setAdminUserBlocked(user.id, next);
      setUsers((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      setDetail((current) => (current?.id === updated.id ? updated : current));
      showToast({
        title: next ? "User blocked" : "User unblocked",
        description: updated.email,
      });
      setNonce((value) => value + 1);
    } catch (blockError) {
      showToast({
        title: "Action failed",
        description:
          blockError instanceof Error ? blockError.message : "Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card/80 p-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email"
          aria-label="Search users"
          className="min-w-[220px] flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          aria-label="Filter by role"
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="">All roles</option>
          <option value="customer">Customers</option>
          <option value="vendor">Vendors</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={blocked}
          onChange={(event) => setBlocked(event.target.value)}
          aria-label="Filter by account status"
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="">All accounts</option>
          <option value="true">Blocked</option>
          <option value="false">Active</option>
        </select>
        <button
          type="button"
          onClick={() => setNonce((value) => value + 1)}
          aria-label="Refresh users"
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
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" /> Loading users...
          </div>
        ) : users.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-muted">
            No users match these filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-[11px] font-semibold text-primary">
                          {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getInitials(user.name)
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted">
                      {user.roles.join(", ")}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted">
                      {user.subscriptionPlan}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatEventDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {user.businessName || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.isBlocked
                            ? "bg-error/15 text-error"
                            : "bg-success/15 text-success"
                        }`}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => void openDetail(user.id)}
                          aria-label={`View ${user.name}`}
                          className="rounded-lg border border-border p-2 text-muted transition hover:text-primary"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          disabled={busyId === user.id}
                          onClick={() => void toggleBlock(user)}
                          aria-label={`${user.isBlocked ? "Unblock" : "Block"} ${user.name}`}
                          className={`rounded-lg border p-2 transition disabled:opacity-60 ${
                            user.isBlocked
                              ? "border-success/30 text-success hover:bg-success/10"
                              : "border-error/30 text-error hover:bg-error/10"
                          }`}
                        >
                          {user.isBlocked ? <Unlock size={15} /> : <Lock size={15} />}
                        </button>
                      </div>
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
            Page {meta.page} of {meta.totalPages} · {meta.total} users
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

      {detailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-4 backdrop-blur-sm">
          <div className="rounded-2xl bg-card p-8 shadow-xl">
            <Loader2 size={20} className="mx-auto animate-spin text-primary" />
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-user-detail-title"
            className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-6 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-semibold text-primary">
                  {detail.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={detail.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(detail.name)
                  )}
                </span>
                <div>
                  <h2
                    id="admin-user-detail-title"
                    className="font-serif text-xl text-foreground"
                  >
                    {detail.name}
                  </h2>
                  <p className="text-xs text-muted">{detail.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                aria-label="Close user details"
                className="rounded-lg p-1.5 text-muted hover:bg-secondary"
              >
                <X size={18} />
              </button>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <DetailRow label="Roles" value={detail.roles.join(", ")} />
              <DetailRow label="Subscription plan" value={detail.subscriptionPlan} />
              <DetailRow
                label="Account status"
                value={detail.isBlocked ? "Blocked" : "Active"}
              />
              <DetailRow
                label="Joined"
                value={formatEventDate(detail.createdAt)}
              />
              <DetailRow
                label="Business"
                value={detail.businessName || "Not provided"}
              />
            </dl>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted transition hover:text-primary"
              >
                Close
              </button>
              <button
                type="button"
                disabled={busyId === detail.id}
                onClick={() => void toggleBlock(detail)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60 ${
                  detail.isBlocked
                    ? "bg-success hover:bg-success/90"
                    : "bg-error hover:bg-error/90"
                }`}
              >
                {detail.isBlocked ? <Unlock size={15} /> : <ShieldCheck size={15} />}
                {detail.isBlocked ? "Unblock user" : "Block user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-2 last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium capitalize text-foreground">{value}</dd>
    </div>
  );
}
