import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  ExternalLink,
  Layers3,
  PlusCircle,
} from "lucide-react";

type QuickAction = {
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
};

const actions: QuickAction[] = [
  {
    title: "Add New Service",
    description: "Create a new listing for your business.",
    icon: <PlusCircle size={18} />,
  },
  {
    title: "My Services",
    description: "Review your current service listings.",
    icon: <Layers3 size={18} />,
  },
  {
    title: "Business Profile",
    description: "Manage the details couples see about you.",
    icon: <Building2 size={18} />,
  },
  {
    title: "View Public Services",
    description: "See what couples can browse on WedPlan.",
    icon: <ExternalLink size={18} />,
    href: "/services",
  },
];

export default function QuickActions() {
  return (
    <section className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
        Shortcuts
      </p>
      <h2 className="mt-2 font-serif text-xl text-foreground">Quick actions</h2>

      <div className="mt-5 space-y-2.5">
        {actions.map((action) =>
          action.href ? (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center gap-3 rounded-xl border border-border/70 bg-background/60 p-3.5 transition-all hover:border-accent/60 hover:bg-secondary/60"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                {action.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">
                  {action.title}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-muted">
                  {action.description}
                </span>
              </span>
              <ArrowUpRight
                size={16}
                className="shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </Link>
          ) : (
            <button
              key={action.title}
              type="button"
              disabled
              title="This route is planned for a later milestone"
              className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl border border-border/70 bg-background/40 p-3.5 text-left opacity-75"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                {action.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  {action.title}
                  <span className="rounded-full bg-champagne/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-champagne">
                    Soon
                  </span>
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-muted">
                  {action.description}
                </span>
              </span>
            </button>
          )
        )}
      </div>
    </section>
  );
}
