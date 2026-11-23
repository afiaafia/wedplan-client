"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, Heart, ShieldCheck } from "lucide-react";
import {
  getRoleDashboard,
  type UserRole,
} from "@/lib/roles";
import { setSessionActiveRole } from "@/lib/active-role";
import { useActiveDashboardRole } from "@/lib/use-active-dashboard-role";

const roleOptions = [
  {
    role: "customer",
    label: "Customer",
    description: "Continue planning your celebration and manage bookings.",
    icon: Heart,
  },
  {
    role: "vendor",
    label: "Vendor",
    description: "Manage your wedding services and booking requests.",
    icon: BriefcaseBusiness,
  },
] as const;

export default function DashboardEntry({
  sessionId,
  roles,
}: {
  sessionId: string;
  roles: UserRole[];
}) {
  const router = useRouter();
  const activeRole = useActiveDashboardRole(
    sessionId,
    roles.join("|"),
    "/dashboard"
  );

  useEffect(() => {
    if (activeRole) {
      router.replace(getRoleDashboard(activeRole));
    }
  }, [activeRole, router]);

  if (activeRole) {
    return (
      <main
        aria-busy="true"
        className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-12"
      >
        <p className="text-sm text-muted">Loading your dashboard...</p>
      </main>
    );
  }

  const canChooseRole =
    roles.includes("customer") &&
    roles.includes("vendor") &&
    !roles.includes("admin");

  if (!canChooseRole) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-12">
        <section
          aria-labelledby="dashboard-access-heading"
          className="w-full max-w-lg rounded-3xl border border-border bg-card p-7 text-center shadow-lg sm:p-10"
        >
          <ShieldCheck className="mx-auto text-primary" size={28} aria-hidden="true" />
          <h1
            id="dashboard-access-heading"
            className="mt-4 font-serif text-2xl text-foreground"
          >
            Dashboard access unavailable
          </h1>
          <p className="mt-2 text-sm text-muted">
            We could not find a dashboard role for this account. Please sign in
            again.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/sign-in")}
            className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Return to sign in
          </button>
        </section>
      </main>
    );
  }

  function chooseRole(role: "customer" | "vendor") {
    if (!roles.includes(role) || roles.includes("admin")) return;
    setSessionActiveRole(sessionId, role, roles);
    router.replace(getRoleDashboard(role));
  }

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-secondary/25 px-4 py-12">
      <section
        aria-labelledby="dashboard-choice-heading"
        className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-9"
      >
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-champagne">
          Welcome back
        </p>
        <h1
          id="dashboard-choice-heading"
          className="mt-2 text-center font-serif text-3xl text-foreground"
        >
          Choose your dashboard
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm leading-6 text-muted">
          This account has Customer and Vendor access. Choose how you would like
          to continue.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
          {roleOptions.map(({ role, label, description, icon: Icon }) => (
            <button
              key={role}
              type="button"
              onClick={() => chooseRole(role)}
              className="group flex min-h-28 items-start gap-3 rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/50 hover:bg-secondary/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-5"
              aria-label={`Continue to the ${label} dashboard`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <Icon size={19} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-foreground">
                  {label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted">
                  {description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
