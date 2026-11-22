import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import type { SessionUser } from "@/lib/auth-server";
import { normalizeRole, normalizeRoles } from "@/lib/roles";

const roleLabels = {
  customer: "Couple",
  vendor: "Vendor",
  admin: "Administrator",
} as const;

export type DashboardCardConfig = {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  comingSoon?: boolean;
};

type RoleDashboardProps = {
  user: SessionUser;
  eyebrow: string;
  title: string;
  description: string;
  cards: DashboardCardConfig[];
};

export function RoleDashboard({
  user,
  eyebrow,
  title,
  description,
  cards,
}: RoleDashboardProps) {
  const role = normalizeRole(user.role);
  const roles = normalizeRoles(user.roles, user.role);
  const initials =
    user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-16 pt-32 sm:px-6">
      <div className="pointer-events-none absolute left-[-160px] top-32 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-[-100px] h-80 w-80 rounded-full bg-champagne/15 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || "User"}
                className="h-16 w-16 rounded-2xl object-cover shadow-md"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white shadow-md shadow-primary/20">
                {initials}
              </span>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
                {eyebrow}
              </p>
              <h1 className="font-serif text-3xl text-foreground sm:text-4xl">
                {title},{" "}
                <span className="text-primary">
                  {user.name?.split(" ")[0] || "there"}
                </span>
                .
              </h1>
              <p className="mt-1.5 max-w-md text-sm leading-6 text-muted">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <DashboardCard key={card.title} {...card} />
          ))}
        </div>

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-xs font-medium text-muted backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Signed in as{" "}
          <span className="font-semibold text-foreground">{user.email}</span>
          &nbsp;·&nbsp;
          <span className="font-semibold text-primary">
            {roles.map((userRole) => roleLabels[userRole]).join(" · ") || roleLabels[role]}
          </span>
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
  icon,
  title,
  description,
  href,
  comingSoon,
}: DashboardCardConfig) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md"
      aria-disabled={comingSoon}
      tabIndex={comingSoon ? -1 : 0}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        {icon}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {comingSoon && (
            <span className="rounded-full bg-champagne/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-champagne">
              Soon
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
      </div>

      {!comingSoon && (
        <ArrowRight
          size={15}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-muted opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1"
        />
      )}
    </Link>
  );
}
