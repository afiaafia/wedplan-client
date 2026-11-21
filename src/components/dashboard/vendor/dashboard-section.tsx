import type { ReactNode } from "react";

type DashboardSectionProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
};

export default function DashboardSection({
  icon,
  title,
  description,
  action,
  children,
  className = "",
  id,
}: DashboardSectionProps) {
  return (
    <section
      id={id}
      className={`rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            {icon}
          </span>
          <div>
            <h2 className="font-serif text-xl text-foreground">{title}</h2>
            {description && (
              <p className="mt-1 max-w-xl text-xs leading-5 text-muted">
                {description}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}
