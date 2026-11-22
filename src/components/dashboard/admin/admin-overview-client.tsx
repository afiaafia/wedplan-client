"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import {
  getAdminDashboard,
  type AdminDashboardData,
} from "@/lib/admin-api";
import { formatEventDate, getInitials } from "@/lib/vendor-dashboard";

const STAT_LABELS: Array<{ key: keyof AdminDashboardData["stats"]; label: string }> = [
  { key: "totalUsers", label: "Total users" },
  { key: "totalCustomers", label: "Customers" },
  { key: "totalVendors", label: "Vendors" },
  { key: "totalServices", label: "Total services" },
  { key: "pendingServiceApprovals", label: "Pending approvals" },
  { key: "totalBookings", label: "Total bookings" },
  { key: "totalTransactions", label: "Transactions" },
  { key: "premiumVendors", label: "Premium vendors" },
];

export default function AdminOverviewClient() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      setData(await getAdminDashboard(signal));
    } catch (loadError) {
      if (signal?.aborted) return;
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load platform statistics."
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) void load(controller.signal);
    });
    return () => controller.abort();
  }, [load, nonce]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-xl text-foreground">Platform at a glance</h2>
        <button
          type="button"
          onClick={() => setNonce((value) => value + 1)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted transition hover:text-primary"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
        >
          <span className="flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </span>
          <button
            type="button"
            onClick={() => setNonce((value) => value + 1)}
            className="rounded-full border border-error/40 px-3 py-1 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_LABELS.map((item) => (
            <div
              key={item.key}
              className="h-28 animate-pulse rounded-2xl border border-border/70 bg-card/70"
            />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STAT_LABELS.map((item) => (
              <div
                key={item.key}
                className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {item.label}
                </p>
                <p className="mt-3 font-serif text-3xl text-foreground">
                  {data.stats[item.key]}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <section className="rounded-2xl border border-border/70 bg-card/80 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg text-foreground">Recent users</h3>
                <Link
                  href="/dashboard/admin/users"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Manage users
                </Link>
              </div>
              <RecentList
                empty="No registrations yet."
                items={data.recentUsers.map((user) => ({
                  id: user.id,
                  primary: user.name,
                  secondary: `${user.email} · ${user.roles.join(", ")}`,
                  image: user.image,
                  meta: formatEventDate(user.createdAt),
                }))}
              />
            </section>

            <section className="rounded-2xl border border-border/70 bg-card/80 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg text-foreground">
                  Recently submitted services
                </h3>
                <Link
                  href="/dashboard/admin/services"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Review services
                </Link>
              </div>
              <RecentList
                empty="No services have been submitted yet."
                items={data.recentServices.map((service) => ({
                  id: service.id,
                  primary: service.title,
                  secondary: `${service.category} · ${service.approvalStatus}`,
                  image: service.image,
                  meta: formatEventDate(service.createdAt),
                }))}
              />
            </section>

            <section className="rounded-2xl border border-border/70 bg-card/80 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg text-foreground">Recent bookings</h3>
                <Link
                  href="/dashboard/admin/bookings"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View bookings
                </Link>
              </div>
              <RecentList
                empty="No booking requests yet."
                items={data.recentBookings.map((booking) => ({
                  id: booking.id,
                  primary: `Booking ${booking.status}`,
                  secondary: `Event ${formatEventDate(booking.eventDate)}`,
                  meta: formatEventDate(booking.createdAt),
                }))}
              />
            </section>

            <section className="rounded-2xl border border-border/70 bg-card/80 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg text-foreground">
                  Recent transactions
                </h3>
                <Link
                  href="/dashboard/admin/transactions"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View transactions
                </Link>
              </div>
              <RecentList
                empty="No transactions recorded yet."
                items={data.recentTransactions.map((transaction) => ({
                  id: transaction.id,
                  primary: `${transaction.plan} · ${transaction.status}`,
                  secondary: `${transaction.currency.toUpperCase()} ${transaction.amount} · ${transaction.vendorName ?? "Vendor"}`,
                  meta: formatEventDate(transaction.createdAt),
                }))}
              />
            </section>
          </div>
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          Platform statistics are unavailable.
        </p>
      )}
    </div>
  );
}

function RecentList({
  items,
  empty,
}: {
  items: Array<{
    id: string;
    primary: string;
    secondary: string;
    meta: string;
    image?: string;
  }>;
  empty: string;
}) {
  if (items.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted">
        {empty}
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-[11px] font-semibold text-primary">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image} alt="" className="h-full w-full object-cover" />
            ) : (
              getInitials(item.primary)
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {item.primary}
            </p>
            <p className="truncate text-xs text-muted">{item.secondary}</p>
          </div>
          <span className="shrink-0 text-[11px] text-muted">{item.meta}</span>
        </li>
      ))}
    </ul>
  );
}
