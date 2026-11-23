"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Crown } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  getPrimaryRole,
  getRoleDashboard,
  normalizeRoles,
  type UserRole,
} from "@/lib/roles";
import CustomerQuickGuide from "./customer-quick-guide";
import HowItWorksUniverse, {
  CursorDust,
  RoleWorkflowPanel,
  type RoleAction,
} from "./how-it-works-universe";
import { useHydrationComplete } from "./use-hydration-complete";

const EASE = [0.22, 1, 0.36, 1] as const;

function signInCallback(path: string) {
  return `/sign-in?callbackURL=${encodeURIComponent(path)}`;
}

function dashboardAction(roles: readonly UserRole[]): RoleAction {
  const role = getPrimaryRole(roles[0], roles);

  return {
    label:
      role === "admin"
        ? "Open Admin Dashboard"
        : role === "vendor"
          ? "Go to Vendor Dashboard"
          : "Go to My Dashboard",
    href: getRoleDashboard(role, roles),
  };
}

function getRoleActions(
  selectedRole: UserRole,
  roles: readonly UserRole[],
  authPending: boolean
): { primary: RoleAction; secondary?: RoleAction; notice?: string } {
  if (selectedRole === "customer") {
    return {
      primary: {
        label: "Explore Wedding Services",
        href: "/services",
      },
      secondary:
        authPending || roles.length === 0
          ? {
              label: "Go to My Dashboard",
              href: signInCallback("/dashboard/customer"),
            }
          : roles.includes("customer")
            ? {
                label: "Go to My Dashboard",
                href: "/dashboard/customer",
              }
            : dashboardAction(roles),
    };
  }

  if (selectedRole === "vendor") {
    if (authPending) {
      return {
        primary: {
          label: "Explore Wedding Services",
          href: "/services",
        },
      };
    }

    if (roles.includes("vendor")) {
      return {
        primary: {
          label: "Manage My Services",
          href: "/dashboard/vendor/services",
        },
        secondary: {
          label: "Vendor Dashboard",
          href: "/dashboard/vendor",
        },
      };
    }

    if (roles.includes("admin")) {
      return {
        primary: {
          label: "Open Admin Dashboard",
          href: "/dashboard/admin",
        },
        secondary: {
          label: "Manage Admin Services",
          href: "/dashboard/admin/services",
        },
        notice:
          "Vendor access cannot be activated for an Admin-only account. Your Admin access remains unchanged.",
      };
    }

    if (roles.includes("customer")) {
      return {
        primary: {
          label: "Activate Vendor Access",
          href: "/vendor/onboarding",
        },
        secondary: {
          label: "Customer Dashboard",
          href: "/dashboard/customer",
        },
      };
    }

    return {
      primary: {
        label: "Join as a Vendor",
        href: "/sign-up?role=vendor",
      },
      secondary: {
        label: "Manage My Services",
        href: signInCallback("/dashboard/vendor/services"),
      },
    };
  }

  if (roles.includes("admin")) {
    return {
      primary: {
        label: "Open Admin Dashboard",
        href: "/dashboard/admin",
      },
      secondary: {
        label: "Manage Services",
        href: "/dashboard/admin/services",
      },
    };
  }

  if (authPending || roles.length === 0) {
    return {
      primary: {
        label: "Open Admin Dashboard",
        href: signInCallback("/dashboard/admin"),
      },
      secondary: {
        label: "Manage Services",
        href: signInCallback("/dashboard/admin/services"),
      },
      notice: "Admin tools require an authorized Admin account.",
    };
  }

  return {
    primary: dashboardAction(roles),
    secondary: {
      label: "Explore Wedding Services",
      href: "/services",
    },
    notice: "Admin tools are restricted to administrator accounts.",
  };
}

function getClosingAction(
  roles: readonly UserRole[],
  authPending: boolean
): RoleAction | null {
  if (authPending) return null;

  if (roles.includes("vendor")) {
    return {
      label: "Manage My Services",
      href: "/dashboard/vendor/services",
    };
  }

  if (roles.includes("admin")) {
    return {
      label: "Open Admin Dashboard",
      href: "/dashboard/admin",
    };
  }

  if (roles.includes("customer")) {
    return {
      label: "Activate Vendor Access",
      href: "/vendor/onboarding",
    };
  }

  return {
    label: "Become a Vendor",
    href: "/sign-up?role=vendor",
  };
}

function getPremiumAction(
  roles: readonly UserRole[],
  authPending: boolean
): RoleAction | null {
  if (authPending || roles.length === 0) {
    return {
      label: "Discover Premium",
      href: signInCallback("/dashboard/vendor/subscription"),
    };
  }

  if (roles.includes("vendor")) {
    return {
      label: "Discover Premium",
      href: "/dashboard/vendor/subscription",
    };
  }

  if (roles.includes("admin")) return null;

  if (roles.includes("customer")) {
    return {
      label: "Discover Premium",
      href: "/vendor/onboarding",
    };
  }

  return null;
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, {
    once: false,
    margin: "80px 0px",
  });
  const isHydrated = useHydrationComplete();
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = !isHydrated || prefersReducedMotion !== false;
  const [activeRole, setActiveRole] = useState<UserRole>("customer");
  const { data: session, isPending } = useSession();
  const sessionResolved = isHydrated && !isPending;
  const roles =
    sessionResolved && session?.user
      ? normalizeRoles(session.user.roles, session.user.role)
      : [];
  const authPending = !sessionResolved;
  const actions = getRoleActions(activeRole, roles, authPending);
  const closingAction = getClosingAction(roles, authPending);
  const premiumAction = getPremiumAction(roles, authPending);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="how-it-works-heading"
      className="relative isolate overflow-hidden bg-secondary/25 px-4 py-8 sm:px-6 sm:py-9 lg:px-10 lg:py-10"
    >
      <CursorDust sectionRef={sectionRef} reduceMotion={reduceMotion} />
      <div className="pointer-events-none absolute -right-16 top-20 z-0 h-40 w-40 rounded-full bg-champagne/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-champagne sm:text-xs">
            How WedPlan Works
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-1.5 font-serif text-2xl leading-tight tracking-tight text-foreground lg:text-4xl"
          >
            From &ldquo;Yes&rdquo; to &ldquo;I Do&rdquo;
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-muted sm:text-sm sm:leading-6">
            One platform. Three roles. A seamless wedding planning experience.
          </p>
        </motion.header>

        <HowItWorksUniverse
          activeRole={activeRole}
          onSelectRole={setActiveRole}
          reduceMotion={reduceMotion}
          isInView={isInView}
        />

        <motion.div
          id="how-it-works-workflow-panel"
          role="region"
          aria-labelledby={`how-it-works-${activeRole}-workflow-heading`}
          layout
          transition={{
            layout: {
              duration: reduceMotion ? 0 : 0.24,
              ease: EASE,
            },
          }}
          className="mt-3"
        >
          <RoleWorkflowPanel
            key={activeRole}
            role={activeRole}
            actions={actions}
            notice={actions.notice}
            reduceMotion={reduceMotion}
            isInView={isInView}
          />
        </motion.div>

        <CustomerQuickGuide
          reduceMotion={reduceMotion}
          isInView={isInView}
        />

        {premiumAction && (
          <motion.aside
            aria-labelledby="premium-promo-heading-how-it-works"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.35, delay: 0.04, ease: EASE }}
            className="mt-3 flex flex-col gap-3 rounded-2xl border border-champagne/30 bg-champagne/5 p-3 shadow-[0_6px_20px_rgba(48,39,42,0.04)] sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-4 sm:px-5"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-champagne/25 bg-champagne/10 text-champagne sm:h-10 sm:w-10 sm:rounded-xl">
                <Crown size={16} aria-hidden="true" className="sm:h-[18px] sm:w-[18px]" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-champagne">
                  For Wedding Professionals
                </p>
                <h3
                  id="premium-promo-heading-how-it-works"
                  className="mt-0.5 font-serif text-base leading-tight text-foreground sm:text-lg lg:text-xl"
                >
                  Take Your Wedding Business to the Next Level
                </h3>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-muted sm:text-sm">
                  Get more room to grow, showcase your services, and connect
                  with couples looking for their perfect wedding team.
                </p>
              </div>
            </div>
            <Link
              href={premiumAction.href}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-full border border-champagne/40 bg-background/80 px-4 py-2 text-xs font-semibold text-primary transition-colors hover:border-champagne hover:bg-champagne/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none sm:self-center sm:text-sm"
            >
              {premiumAction.label}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </motion.aside>
        )}

        <div className="mt-3 flex flex-col items-start justify-between gap-3 rounded-2xl border border-champagne/25 bg-card/85 px-4 py-3 shadow-[0_8px_24px_rgba(48,39,42,0.04)] sm:flex-row sm:items-center sm:px-5">
          <div className="min-w-0">
            <h3 className="font-serif text-base leading-tight text-foreground sm:text-lg lg:text-xl">
              Ready to Begin Your Wedding Journey?
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">
              Find the right people to make your day unforgettable.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            <Link
              href="/services"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-center text-xs font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none sm:text-sm"
            >
              Explore Wedding Services
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
            {closingAction && (
              <Link
                href={closingAction.href}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-center text-xs font-semibold text-foreground transition-colors hover:border-champagne/60 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none sm:text-sm"
              >
                {closingAction.label}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
