import type { ReactNode } from "react";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: number | null;
  hint: string;
};

export default function StatCard({ icon, label, value, hint }: StatCardProps) {
  const hasValue = typeof value === "number";

  return (
    <article className="group rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
          {icon}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
            hasValue
              ? "bg-success/10 text-success"
              : "bg-secondary text-muted"
          }`}
        >
          {hasValue ? "Live" : "Unavailable"}
        </span>
      </div>

      <p className="mt-5 text-2xl font-semibold text-foreground" aria-live="polite">
        {hasValue ? value : "\u2014"}
        <span className="sr-only">
          {hasValue ? "" : ` ${label} data is not available yet`}
        </span>
      </p>
      <p className="mt-1 text-sm font-medium text-foreground/80">{label}</p>
      <p className="mt-2 text-xs leading-5 text-muted">{hint}</p>
    </article>
  );
}
