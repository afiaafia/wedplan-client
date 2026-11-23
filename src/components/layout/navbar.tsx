"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Heart,
  Settings,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "./theme-toggle";
import { useSession } from "@/lib/auth-client";
import { useLogout } from "@/lib/use-logout";
import {
  getRoleDashboard,
  normalizeRoles,
} from "@/lib/roles";
import { useActiveDashboardRole } from "@/lib/use-active-dashboard-role";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
];

function isNavLinkActive(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const { logout } = useLogout();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [failedImage, setFailedImage] = useState<string | null>(null);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const user = session?.user;
  const roles = normalizeRoles(user?.roles, user?.role);
  const activeRole = useActiveDashboardRole(
    session?.session?.id ?? null,
    roles.join("|"),
    pathname
  );

  useEffect(() => {
    if (!mobileOpen) return;

    function handleOutsideClick(event: PointerEvent) {
      const target = event.target as Node;

      if (
        !mobileMenuRef.current?.contains(target) &&
        !mobileButtonRef.current?.contains(target)
      ) {
        setMobileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!profileOpen) return;

    function handleOutsideClick(event: PointerEvent) {
      const target = event.target as Node;

      if (
        !profileMenuRef.current?.contains(target) &&
        !profileButtonRef.current?.contains(target)
      ) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileOpen(false);
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileOpen]);

  const isAuthenticated = !!user;
  const dashboardHref = activeRole
    ? getRoleDashboard(activeRole)
    : "/dashboard";

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  if (pathname === "/vendor/sign-in") {
    return (
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/70 bg-card/85 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-345 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* WedPlan logo on the left */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5"
            onClick={() => setMobileOpen(false)}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20 transition-transform group-hover:rotate-[-8deg]">
              <Heart size={19} strokeWidth={1.8} />
            </span>

            <span className="font-serif text-[26px] font-semibold tracking-tight text-foreground">
              WedPlan<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Minimal navigation on right */}
          <div className="hidden items-center gap-3 sm:flex">
            <ThemeToggle />
            <Link
              href="/services"
              className="px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:text-primary"
            >
              Browse Services
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-all hover:border-primary/50 hover:bg-secondary/70"
            >
              Customer Sign In
            </Link>
          </div>

          {/* Responsive mobile menu control */}
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
            <button
              ref={mobileButtonRef}
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/75 shadow-sm backdrop-blur-xl transition-all"
            >
              <span className="relative block h-5 w-6">
                <motion.span
                  animate={mobileOpen ? { top: "9px", rotate: 45, width: "22px" } : { top: "5px", rotate: 0, width: "22px" }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-0 h-0.5 rounded-full bg-primary"
                />
                <motion.span
                  animate={mobileOpen ? { top: "9px", rotate: -45, width: "22px" } : { top: "15px", rotate: 0, width: "14px" }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-0 h-0.5 rounded-full bg-primary"
                />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="border-t border-border/70 bg-card/95 px-4 py-4 sm:hidden"
            >
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-medium text-muted hover:bg-secondary hover:text-primary"
                >
                  Home
                </Link>
                <Link
                  href="/services"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-medium text-muted hover:bg-secondary hover:text-primary"
                >
                  Browse Services
                </Link>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-medium text-muted hover:bg-secondary hover:text-primary"
                >
                  Customer Sign In
                </Link>
                <Link
                  href="/sign-up?role=vendor"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-primary hover:bg-secondary"
                >
                  Become a Vendor
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    );
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav className="mx-auto flex h-18 max-w-345 items-center justify-between rounded-2xl border border-white/80 bg-white/65 px-5 shadow-[0_8px_40px_rgba(48,39,42,0.07)] backdrop-blur-2xl backdrop-saturate-150 sm:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20 transition-transform group-hover:rotate-[-8deg]">
            <Heart size={19} strokeWidth={1.8} />
          </span>

          <span className="font-serif text-[26px] font-semibold tracking-tight text-foreground">
            WedPlan<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/80 bg-white/45 p-1.5 shadow-sm backdrop-blur-xl md:flex">
          {navLinks.map((link) => {
            const active = isNavLinkActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-5 py-2.5 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:bg-white/80 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Auth Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {isPending ? (
            <div className="h-10 w-28 animate-pulse rounded-full bg-secondary" />
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                ref={profileButtonRef}
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                aria-label="Open profile menu"
                className="flex items-center gap-2.5 rounded-full border border-white/90 bg-white/70 py-1.5 pl-1.5 pr-3 shadow-sm transition-all hover:bg-white hover:shadow-md"
              >
                {user.image && failedImage !== user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    onError={() => setFailedImage(user.image ?? null)}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                    {initials}
                  </span>
                )}

                <span className="max-w-27.5 truncate text-sm font-semibold text-foreground">
                  {user.name || "My Account"}
                </span>

                <ChevronDown
                  size={15}
                  className={`text-muted transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    ref={profileMenuRef}
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-[calc(100%+14px)] w-64 overflow-hidden rounded-2xl border border-white/80 bg-white/85 p-2 shadow-[0_15px_50px_rgba(48,39,42,0.13)] backdrop-blur-2xl"
                  >
                    <div className="border-b border-border px-3 py-3">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {user.name || "User"}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted">
                        {user.email}
                      </p>
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {roles.join(" · ")}
                      </p>
                    </div>

                    <div className="space-y-1 py-2">
                      <Link
                        href={dashboardHref}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-secondary hover:text-primary"
                      >
                        <LayoutDashboard size={17} />
                        Dashboard
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-secondary hover:text-primary"
                      >
                        <Settings size={17} />
                        Profile Settings
                      </Link>
                    </div>

                    <div className="border-t border-border pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          void logout();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-error transition-colors hover:bg-red-50"
                      >
                        <LogOut size={17} />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/vendor/sign-in"
                className="px-3.5 py-2 text-xs font-semibold tracking-wide text-muted transition-colors hover:text-primary"
              >
                Sign in as Vendor
              </Link>

              <Link
                href="/sign-in"
                className="px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-primary"
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/15 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Theme and Menu Controls */}
        <div className="ml-auto flex shrink-0 items-center gap-2 md:hidden">
          {/* Light / Dark Theme Toggle */}
          <ThemeToggle />
          {/* Minimal morphing menu */}
          <button
            ref={mobileButtonRef}
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="group flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card/75 shadow-sm backdrop-blur-xl transition-all duration-300 hover:rotate-12 hover:scale-110 hover:border-accent/50 hover:shadow-lg active:scale-90 md:hidden"
          >
            <span className="relative block h-6 w-7">
              <motion.span
                animate={mobileOpen ? { top: "11px", rotate: 45, width: "26px" } : { top: "6px", rotate: 0, width: "26px" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 h-0.5 rounded-full bg-primary"
              />
              <motion.span
                animate={mobileOpen ? { top: "11px", rotate: -45, width: "26px" } : { top: "18px", rotate: 0, width: "16px" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 h-0.5 rounded-full bg-primary"
              />
            </span>
          </button>
        </div>

      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-2 max-w-345 rounded-2xl border border-white/80 bg-white/85 p-4 shadow-xl backdrop-blur-2xl md:hidden"
          >
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isNavLinkActive(pathname, link.href)
                      ? "bg-primary text-white"
                      : "text-muted hover:bg-secondary hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {!isPending && (
              <div className="mt-3 border-t border-border pt-3">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-3">
                      {user.image && failedImage !== user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.image}
                          alt={user.name || "User"}
                          onError={() => setFailedImage(user.image ?? null)}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                          {initials}
                        </span>
                      )}

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {user.name || "User"}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={dashboardHref}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted hover:bg-secondary hover:text-primary"
                    >
                      <LayoutDashboard size={17} />
                      Dashboard
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted hover:bg-secondary hover:text-primary"
                    >
                      <Settings size={17} />
                      Profile Settings
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        void logout();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-error hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/sign-in"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-full border border-border py-3 text-center text-sm font-semibold text-primary"
                      >
                        Sign In
                      </Link>

                      <Link
                        href="/sign-up"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-full bg-primary py-3 text-center text-sm font-semibold text-white"
                      >
                        Sign Up
                      </Link>
                    </div>

                    <div className="pt-1 text-center">
                      <Link
                        href="/vendor/sign-in"
                        onClick={() => setMobileOpen(false)}
                        className="text-xs font-semibold text-primary transition-colors hover:text-primary-hover hover:underline"
                      >
                        Sign in as Vendor &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
