"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { PackageOpen, Plus } from "lucide-react";
import DashboardDataError from "./dashboard-data-error";
import DashboardSection from "./dashboard-section";
import ServiceForm from "./service-form";
import VendorServiceRow from "./vendor-service-row";
import type { VendorPlan } from "@/lib/subscription";
import {
  createVendorApiError,
  messageForVendorApiError,
  setVendorServiceActive,
  type VendorApiError,
  type VendorApiErrorCode,
} from "@/lib/vendor-api";
import type {
  VendorOverviewError,
  VendorService,
  VendorServiceEditorAction,
} from "@/lib/vendor-dashboard";

type MyServicesProps = {
  services: VendorService[];
  plan: VendorPlan;
  activeServices: number | null;
  error: VendorOverviewError;
  editorAction: VendorServiceEditorAction;
};

type ActionError = { message: string; code: VendorApiErrorCode } | null;

export default function MyServices({
  services,
  plan,
  activeServices,
  error,
  editorAction,
}: MyServicesProps) {
  const router = useRouter();
  const pending = useRef<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionErrors, setActionErrors] = useState<Record<string, ActionError>>(
    {}
  );

  const editorService =
    editorAction?.kind === "edit"
      ? services.find((service) => service.id === editorAction.id)
      : undefined;
  const missingEditorService =
    editorAction?.kind === "edit" && !editorService;

  async function handleToggleActive(service: VendorService) {
    if (pending.current) return;

    const key = service.id;
    pending.current = key;
    setPendingId(key);
    setActionErrors((current) => ({ ...current, [key]: null }));

    try {
      await setVendorServiceActive(service.id, !service.isActive);
      router.refresh();
    } catch (caught) {
      const apiError =
        caught instanceof Error
          ? (caught as VendorApiError)
          : createVendorApiError(null, 0, "Unable to change this service's status right now.");
      setActionErrors((current) => ({
        ...current,
        [key]: {
          message: messageForVendorApiError(apiError),
          code: apiError.code ?? "UNKNOWN",
        },
      }));
    } finally {
      pending.current = null;
      setPendingId(null);
    }
  }

  return (
    <DashboardSection
      id="my-services"
      icon={<PackageOpen size={19} />}
      title="My Services"
      description="Your own listings, including pending approval, active, and inactive services."
      action={
        <Link
          href="/dashboard/vendor?service=new"
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary"
        >
          <Plus size={14} />
          Add service
        </Link>
      }
    >
      {error && (
        <div className="mb-4">
          <DashboardDataError error={error} title="Services are unavailable" compact />
        </div>
      )}

      {editorAction?.kind === "create" && (
        <ServiceForm
          mode="create"
          plan={plan}
          activeServices={activeServices}
        />
      )}

      {editorAction?.kind === "edit" && editorService && (
        <ServiceForm
          mode="edit"
          service={editorService}
          plan={plan}
          activeServices={activeServices}
        />
      )}

      {missingEditorService && !error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-xs leading-5 text-error"
        >
          This service was not found in your listings.{" "}
          <Link href="/dashboard/vendor" className="font-semibold underline underline-offset-2">
            Return to your services
          </Link>
        </div>
      )}

      {!error && (
        <>
          {services.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background/40 px-6 py-12 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
                <PackageOpen size={22} />
              </span>
              <h3 className="mt-4 font-serif text-lg text-foreground">
                No listings to display
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                You haven&apos;t created any services yet. Add your first listing to
                start appearing in front of couples.
              </p>
              <Link
                href="/dashboard/vendor?service=new"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                <Plus size={14} />
                Add your first service
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <VendorServiceRow
                  key={service.id}
                  service={service}
                  plan={plan}
                  activeServices={activeServices}
                  busy={pendingId === service.id}
                  actionError={actionErrors[service.id] ?? null}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          )}
        </>
      )}
    </DashboardSection>
  );
}
