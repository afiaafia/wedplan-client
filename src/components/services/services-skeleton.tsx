export default function ServicesSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading services</span>

      <div className="rounded-2xl border border-border/80 bg-card/70 p-5">
        <div className="h-11 w-full animate-pulse rounded-xl bg-secondary sm:max-w-xl" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          <div className="h-11 animate-pulse rounded-xl bg-secondary" />
          <div className="h-11 animate-pulse rounded-xl bg-secondary" />
          <div className="h-11 animate-pulse rounded-xl bg-secondary sm:col-span-2 lg:col-span-1 lg:w-44" />
        </div>
      </div>

      <div className="mt-8 h-4 w-44 animate-pulse rounded bg-secondary" />

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-border/80 bg-card/70"
          >
            <div className="h-52 animate-pulse bg-secondary sm:h-56" />
            <div className="space-y-3 p-6">
              <div className="h-5 w-3/4 animate-pulse rounded bg-secondary" />
              <div className="h-4 w-full animate-pulse rounded bg-secondary" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-secondary" />
              <div className="mt-5 h-9 w-full animate-pulse rounded bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
