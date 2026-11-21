import type { ReactNode } from "react";

type VendorPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
};

export default function VendorPageShell({
  eyebrow,
  title,
  description,
  action,
  children,
}: VendorPageShellProps) {
  return (
    <section>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-serif text-3xl text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {description}
          </p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
