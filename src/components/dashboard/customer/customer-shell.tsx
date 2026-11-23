"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  CalendarCheck2,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  X,
} from "lucide-react";
import { getCustomerInitials } from "@/lib/customer-dashboard";
import { useLogout } from "@/lib/use-logout";

type CustomerShellProps = {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  currentDate: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
};

const navigation = [
  {
    label: "Overview",
    href: "/dashboard/customer",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "My Bookings",
    href: "/dashboard/customer/bookings",
    icon: <CalendarCheck2 size={18} />,
  },
  {
    label: "Browse Services",
    href: "/services",
    icon: <Search size={18} />,
  },
  {
    label: "Profile Settings",
    href: "/dashboard/customer/settings",
    icon: <Settings size={18} />,
  },
];

export default function CustomerShell({
  user,
  currentDate,
  title,
  description,
  action,
  children,
}: CustomerShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { logout, isSigningOut } = useLogout();

  function isActive(href: string): boolean {
    if (href === "/dashboard/customer") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-55 top-32 h-96 w-96 rounded-full bg-accent/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 -right-35 h-96 w-96 rounded-full bg-champagne/15 blur-[120px]" />

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open customer dashboard navigation"
        aria-expanded={open}
        className="fixed left-4 top-26 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-card/90 text-primary shadow-md backdrop-blur-xl lg:hidden"
      >
        <Menu size={20} />
      </button>

      {open && (
        <button
          type="button"
          aria-label="Close customer dashboard navigation"
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
                <Image
                  src={user.image}
                  alt=""
                  width={44}
                  height={44}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                getCustomerInitials(user.name)
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-champagne">
                Couple space
              </p>
              <p className="mt-1 truncate font-serif text-lg text-foreground">
                {user.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close customer dashboard navigation"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-secondary hover:text-primary lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav aria-label="Customer dashboard navigation" className="mt-5 flex-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted/80">
            Manage
          </p>
          <div className="mt-3 space-y-1.5">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "text-muted hover:bg-secondary hover:text-primary"
                }`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {isActive(item.href) && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        <div className="space-y-2">
          <div className="rounded-xl border border-border/70 bg-secondary/60 p-3.5">
            <p className="text-xs font-semibold text-foreground">Your planning hub</p>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              Track every request and keep your celebration details together.
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

      <main className="relative z-10 px-4 pb-16 pt-[168px] sm:px-6 lg:pl-[320px] lg:pr-8 lg:pt-32">
        <div className="mx-auto max-w-350">
          <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
                  Customer dashboard
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-medium text-muted">
                  <CalendarDays size={13} className="text-accent" />
                  {currentDate}
                </span>
              </div>
              <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
                {description}
              </p>
              <p className="mt-2 text-xs text-muted/80">Signed in as {user.email}</p>
            </div>
            {action}
          </header>

          {children}
        </div>
      </main>
    </div>
  );
}
