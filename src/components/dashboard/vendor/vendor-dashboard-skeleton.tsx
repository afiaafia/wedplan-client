export default function VendorDashboardSkeleton() {
  return (
    <div className="relative min-h-screen px-4 pb-16 pt-[168px] sm:px-6 lg:pl-[320px] lg:pr-8 lg:pt-32" aria-busy="true" aria-label="Loading vendor dashboard">
      <span className="sr-only">Loading vendor dashboard</span>

      <div className="mx-auto max-w-350">
        <div className="mb-8">
          <div className="h-4 w-40 animate-pulse rounded bg-secondary" />
          <div className="mt-5 h-12 w-full max-w-lg animate-pulse rounded-xl bg-secondary" />
          <div className="mt-3 h-5 w-full max-w-xl animate-pulse rounded bg-secondary" />
        </div>

        <div className="h-6 w-52 animate-pulse rounded bg-secondary" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border/70 bg-card/70 p-5"
            >
              <div className="h-10 w-10 animate-pulse rounded-xl bg-secondary" />
              <div className="mt-6 h-8 w-16 animate-pulse rounded bg-secondary" />
              <div className="mt-3 h-4 w-28 animate-pulse rounded bg-secondary" />
              <div className="mt-4 h-3 w-full animate-pulse rounded bg-secondary" />
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
          <div className="space-y-6">
            <div className="h-72 animate-pulse rounded-2xl border border-border/70 bg-card/70" />
            <div className="h-72 animate-pulse rounded-2xl border border-border/70 bg-card/70" />
          </div>
          <div className="space-y-6">
            <div className="h-80 animate-pulse rounded-2xl border border-border/70 bg-card/70" />
            <div className="h-80 animate-pulse rounded-2xl border border-border/70 bg-card/70" />
          </div>
        </div>
      </div>
    </div>
  );
}
