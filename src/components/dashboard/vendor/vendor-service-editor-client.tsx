"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import ServiceForm from "./service-form";
import { getVendorService } from "@/lib/vendor-api";
import type { VendorPlan } from "@/lib/subscription";
import type { VendorService } from "@/lib/vendor-dashboard";

type VendorServiceEditorClientProps = {
  id: string;
  plan: VendorPlan;
  activeServices: number | null;
};

export default function VendorServiceEditorClient({
  id,
  plan,
  activeServices,
}: VendorServiceEditorClientProps) {
  const [service, setService] = useState<VendorService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getVendorService(id, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setService(data);
      })
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load this service."
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted">
        <Loader2 size={16} className="animate-spin" /> Loading service…
      </p>
    );
  }

  if (error || !service) {
    return (
      <div role="alert" className="flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
        <AlertCircle size={16} /> {error ?? "Service not found."}
      </div>
    );
  }

  return (
    <ServiceForm
      mode="edit"
      service={service}
      plan={plan}
      activeServices={activeServices}
    />
  );
}
