import { CalendarDays, MapPin, Sparkles } from "lucide-react";
import { formatPrice, type ServiceDetail } from "@/lib/services-api";

export default function ServiceInformation({
  service,
}: {
  service: ServiceDetail;
}) {
  return (
    <section className="rounded-[28px] border border-border/80 bg-card/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-fit rounded-full border border-border bg-secondary px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
          {service.category}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-success">
          <Sparkles size={13} />
          Approved service
        </span>
      </div>

      <h1 className="mt-5 font-serif text-3xl leading-tight text-foreground sm:text-4xl lg:text-[42px]">
        {service.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
        <p className="flex items-center gap-2">
          <MapPin size={16} className="shrink-0 text-accent" />
          {service.location || "Location not specified"}
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays size={16} className="shrink-0 text-accent" />
          Available for your celebration
        </p>
      </div>

      <div className="my-7 h-px bg-border/70" />

      <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne">
        About this service
      </h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">
        {service.description}
      </p>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-secondary/70 p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {service.price > 0 ? "Starting price" : "Price"}
          </p>
          <p className="mt-1.5 font-serif text-3xl text-primary">
            {service.price > 0 ? formatPrice(service.price) : "On request"}
          </p>
        </div>
        <p className="max-w-[220px] text-xs leading-5 text-muted">
          Final details and availability are confirmed by the vendor after you
          send a request.
        </p>
      </div>
    </section>
  );
}
