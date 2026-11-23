"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  X,
} from "lucide-react";
import { useLogout } from "@/lib/use-logout";
import type { VendorPlan } from "@/lib/subscription";
import { getInitials } from "@/lib/vendor-dashboard";

type SidebarItem = {
  label: string;
  icon: ReactNode;
  href: string;
  match?: (pathname: string) => boolean;
};

const items: SidebarItem[] = [
  {
    label: "Overview",
    icon: <LayoutDashboard size={18} />,
    href: "/dashboard/vendor",
    match: (pathname) => pathname === "/dashboard/vendor",
  },
  {
    label: "My Services",
    icon: <LayoutDashboard size={18} />,
    href: "/dashboard/vendor/services",
    match: (pathname) =>
      pathname.startsWith("/dashboard/vendor/services") &&
      !pathname.endsWith("/new"),
  },
  {
    label: "Add New Service",
    icon: <PlusCircle size={18} />,
    href: "/dashboard/vendor/services/new",
    match: (pathname) => pathname === "/dashboard/vendor/services/new",
  },
  {
    label: "Booking Requests",
    icon: <CalendarDays size={18} />,
    href: "/dashboard/vendor/bookings",
    match: (pathname) => pathname.startsWith("/dashboard/vendor/bookings"),
  },
  {
    label: "Subscription",
    icon: <CreditCard size={18} />,
    href: "/dashboard/vendor/subscription",
    match: (pathname) => pathname.startsWith("/dashboard/vendor/subscription"),
  },
  {
    label: "Profile Settings",
    icon: <Settings size={18} />,
    href: "/settings",
    match: (pathname) => pathname === "/settings",
  },
];

export default function VendorSidebar({
  user,
  plan,
}: {
  user: {
    name: string;
    email: string;
    image?: string | null;
    businessName?: string | null;
  };
  plan: VendorPlan;
}) {
  const pathname = usePathname();
  const { logout, isSigningOut } = useLogout();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setOpen(false));
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open dashboard navigation"
        aria-expanded={open}
        className="fixed left-4 top-26 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-card/90 text-primary shadow-md backdrop-blur-xl lg:hidden"
      >
        <Menu size={20} />
      </button>

      {open && (
        <button
          type="button"
          aria-label="Close dashboard navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-x-0 bottom-0 top-22 z-30 bg-foreground/25 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed bottom-4 left-4 top-26 z-40 flex w-70 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-4 shadow-[0_20px_60px_rgba(48,39,42,0.12)] backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-[120%]"
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/70 px-2 pb-5 pt-2">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-semibold text-primary">
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
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-champagne">
                Vendor space
              </p>
              <p className="mt-1 truncate font-serif text-lg text-foreground">
                {user.businessName?.trim() || user.name}
              </p>
              <p className="truncate text-[11px] text-muted">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close dashboard navigation"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-secondary hover:text-primary lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
            Current plan
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold capitalize text-primary">
            <CreditCard size={14} /> {plan}
            {plan === "premium" && (
              <span className="rounded-full bg-champagne/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-champagne">
                Premium
              </span>
            )}
          </p>
        </div>

        <nav aria-label="Vendor dashboard navigation" className="mt-5 flex-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted/80">
            Manage
          </p>
          <div className="mt-3 space-y-1.5">
            {items.map((item) => {
              const active = item.match?.(pathname) ?? false;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    active
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "text-muted hover:bg-secondary hover:text-primary"
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="space-y-2">
          <div className="rounded-xl border border-border/70 bg-secondary/60 p-3.5">
            <p className="text-xs font-semibold text-foreground">Need a hand?</p>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              Manage listings, respond to couples, and track your subscription here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            disabled={isSigningOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-error transition-colors hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={17} aria-hidden="true" />
            {isSigningOut ? "Signing out..." : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}
