"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  Layers3,
  Menu,
  PlusCircle,
  Settings,
  X,
} from "lucide-react";

type SidebarItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  active?: boolean;
};

const items: SidebarItem[] = [
  {
    label: "Overview",
    icon: <LayoutDashboard size={18} />,
    href: "/dashboard/vendor",
    active: true,
  },
  { label: "My Services", icon: <Layers3 size={18} /> },
  { label: "Add Service", icon: <PlusCircle size={18} /> },
  { label: "Bookings", icon: <CalendarDays size={18} /> },
  { label: "Business Profile", icon: <Building2 size={18} /> },
  { label: "Settings", icon: <Settings size={18} /> },
];

export default function VendorSidebar({
  businessName,
}: {
  businessName?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open dashboard navigation"
        aria-expanded={open}
        className="fixed left-4 top-[104px] z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-card/90 text-primary shadow-md backdrop-blur-xl lg:hidden"
      >
        <Menu size={20} />
      </button>

      {open && (
        <button
          type="button"
          aria-label="Close dashboard navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-x-0 bottom-0 top-[88px] z-30 bg-foreground/25 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed bottom-4 left-4 top-[104px] z-40 flex w-[280px] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-4 shadow-[0_20px_60px_rgba(48,39,42,0.12)] backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-[120%]"
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/70 px-2 pb-5 pt-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-champagne">
              Vendor space
            </p>
            <p className="mt-1 truncate font-serif text-lg text-foreground">
              {businessName?.trim() || "Your business"}
            </p>
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

        <nav aria-label="Vendor dashboard navigation" className="mt-5 flex-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted/80">
            Manage
          </p>
          <div className="mt-3 space-y-1.5">
            {items.map((item) =>
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={item.active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "text-muted hover:bg-secondary hover:text-primary"
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {item.active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  disabled
                  title="This route is planned for a later milestone"
                  className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted opacity-70"
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  <span className="rounded-full bg-champagne/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-champagne">
                    Soon
                  </span>
                </button>
              )
            )}
          </div>
        </nav>

        <div className="rounded-xl border border-border/70 bg-secondary/60 p-3.5">
          <p className="text-xs font-semibold text-foreground">Need a hand?</p>
          <p className="mt-1 text-[11px] leading-5 text-muted">
            More vendor tools are being added in upcoming milestones.
          </p>
        </div>
      </aside>
    </>
  );
}
