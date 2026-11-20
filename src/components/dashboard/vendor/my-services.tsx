import { PackageOpen, Plus } from "lucide-react";
import DashboardSection from "./dashboard-section";
import VendorServiceRow from "./vendor-service-row";
import type { VendorService } from "@/lib/vendor-dashboard";

type MyServicesProps = {
  services: VendorService[];
};

export default function MyServices({ services }: MyServicesProps) {
  return (
    <DashboardSection
      icon={<PackageOpen size={19} />}
      title="My Services"
      description="Recent listings created for your business. Only your own listings can appear here."
      action={
        <button
          type="button"
          disabled
          title="Service creation is planned for a later milestone"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted opacity-70"
        >
          <Plus size={14} />
          Add service
          <span className="rounded-full bg-champagne/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-champagne">
            Soon
          </span>
        </button>
      }
    >
      {services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background/40 px-6 py-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
            <PackageOpen size={22} />
          </span>
          <h3 className="mt-4 font-serif text-lg text-foreground">
            No listings to display
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            The vendor-scoped services API is not connected yet, so no service
            data is shown. Your own approved, pending, rejected, active, and
            inactive listings will appear here when it is available.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-champagne" />
            Placeholder state — no sample data
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <VendorServiceRow key={service.id} service={service} />
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
