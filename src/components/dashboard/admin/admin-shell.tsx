"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  CalendarCheck2,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useLogout } from "@/lib/use-logout";
import { getInitials } from "@/lib/vendor-dashboard";

const navigation = [
  {
    label: "Overview",
    href: "/dashboard/admin",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Manage Users",
    href: "/dashboard/admin/users",
    icon: <Users size={18} />,
  },
  {
    label: "Manage Services",
    href: "/dashboard/admin/services",
    icon: <ShieldCheck size={18} />,
  },
  {
    label: "Manage Bookings",
    href: "/dashboard/admin/bookings",
    icon: <CalendarCheck2 size={18} />,
  },
  {
    label: "Transactions",
    href: "/dashboard/admin/transactions",
    icon: <Receipt size={18} />,
  },
  {
    label: "Profile Settings",
    href: "/settings",
    icon: <Settings size={18} />,
  },
];

export default function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string; image?: string | null };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { logout, isSigningOut } = useLogout();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setOpen(false));
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function isActive(href: string): boolean {
    if (href === "/dashboard/admin") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute -left-55 top-32 h-96 w-96 rounded-full bg-accent/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 -right-35 h-96 w-96 rounded-full bg-champagne/15 blur-[120px]" />

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open admin dashboard navigation"
        aria-expanded={open}
        aria-controls="admin-navigation-drawer"
        className="fixed left-4 top-26 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-card/90 text-primary shadow-md backdrop-blur-xl xl:hidden"
      >
        <Menu size={20} />
      </button>

      {open && (
        <button
          type="button"
          aria-label="Close admin dashboard navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-x-0 bottom-0 top-22 z-30 bg-foreground/25 backdrop-blur-[2px] xl:hidden"
        />
      )}

      <aside
        id="admin-navigation-drawer"
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-label="Admin dashboard navigation"
        className={`fixed bottom-4 left-4 top-26 z-40 flex w-72 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-4 shadow-[0_20px_60px_rgba(48,39,42,0.12)] backdrop-blur-2xl transition-transform duration-300 xl:translate-x-0 ${
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
                Admin space
              </p>
              <p className="mt-1 truncate font-serif text-lg text-foreground">
                {user.name}
              </p>
              <p className="truncate text-[11px] text-muted">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close admin dashboard navigation"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-secondary hover:text-primary xl:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav
          aria-label="Admin dashboard navigation"
          className="mt-5 min-h-0 flex-1 overflow-y-auto"
        >
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted/80">
            Administration
          </p>
          <div className="mt-3 space-y-1.5">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
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

        <div className="shrink-0 rounded-xl border border-border/70 bg-secondary/60 p-3.5">
          <p className="text-xs font-semibold text-foreground">Platform oversight</p>
          <p className="mt-1 text-[11px] leading-5 text-muted">
            Review accounts, listings, bookings, and verified payment records.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          disabled={isSigningOut}
          className="mt-2 flex min-h-11 w-full shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-error transition-colors hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut size={17} aria-hidden="true" />
          {isSigningOut ? "Signing out..." : "Logout"}
        </button>
      </aside>

      <main className="relative z-10 min-w-0 px-4 pb-16 pt-[168px] sm:px-6 xl:pl-[320px] xl:pr-8 xl:pt-32">
        <div className="mx-auto min-w-0 max-w-350">{children}</div>
      </main>
    </div>
  );
}
