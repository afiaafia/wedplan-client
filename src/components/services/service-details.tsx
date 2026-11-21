"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  ApiError,
  getPublicService,
  type ServiceDetail,
} from "@/lib/services-api";
import ServiceDetailsError from "./service-details-error";
import ServiceDetailsSkeleton from "./service-details-skeleton";
import ServiceImageGallery from "./service-image-gallery";
import ServiceInformation from "./service-information";
import VendorInformationCard from "./vendor-information-card";
import BookingCard from "./booking-card";

export default function ServiceDetails({ id }: { id: string }) {
  const [fetchState, setFetchState] = useState<{
    key: string;
    data: ServiceDetail | null;
    error: string | null;
    status: number | null;
  }>({ key: "", data: null, error: null, status: null });
  const [retryCount, setRetryCount] = useState(0);

  const requestKey = `${id}|${retryCount}`;
  const isLoading = fetchState.key !== requestKey;
  const service = fetchState.data;
  const errorMessage = fetchState.error ?? "";
  const status = fetchState.status;

  useEffect(() => {
    const controller = new AbortController();

    getPublicService(id, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setFetchState({ key: requestKey, data, error: null, status: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setFetchState({
          key: requestKey,
          data: null,
          error:
            error instanceof ApiError
              ? error.message
              : "Something went wrong while loading this service.",
          status: error instanceof ApiError ? error.status : null,
        });
      });

    return () => controller.abort();
  }, [id, requestKey]);

  if (isLoading) {
    return <ServiceDetailsSkeleton />;
  }

  if (errorMessage || !service) {
    return (
      <ServiceDetailsError
        status={status}
        message={errorMessage || "This service could not be loaded."}
        onRetry={() => setRetryCount((count) => count + 1)}
      />
    );
  }

  return (
    <article>
      <Link
        href="/services"
        className="inline-flex items-center gap-2 rounded-full text-sm font-semibold text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft size={15} />
        Back to services
      </Link>

      <div className="mt-6">
        <ServiceImageGallery images={service.images ?? []} title={service.title} />
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
        <div className="min-w-0 space-y-6">
          <ServiceInformation service={service} />
          <VendorInformationCard vendor={service.vendor} />
        </div>
        <BookingCard service={service} />
      </div>
    </article>
  );
}
