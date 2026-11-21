export default function ServiceDetailsSkeleton() {
  return (
    <div aria-busy="true" className="animate-pulse">
      <span className="sr-only">Loading service details</span>
      <div className="h-5 w-32 rounded bg-secondary" />
      <div className="mt-6 h-72 rounded-[28px] bg-secondary sm:h-[460px]" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4 rounded-[28px] border border-border/80 bg-card/60 p-8">
          <div className="h-6 w-28 rounded bg-secondary" />
          <div className="h-10 w-4/5 rounded bg-secondary" />
          <div className="h-4 w-2/3 rounded bg-secondary" />
          <div className="mt-6 h-px bg-secondary" />
          <div className="h-4 w-full rounded bg-secondary" />
          <div className="h-4 w-5/6 rounded bg-secondary" />
          <div className="h-4 w-3/4 rounded bg-secondary" />
          <div className="mt-8 h-24 rounded-2xl bg-secondary" />
        </div>
        <div className="h-72 rounded-[28px] bg-secondary" />
      </div>
    </div>
  );
}
