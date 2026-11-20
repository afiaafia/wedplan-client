"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ImageOff,
  MapPin,
  RotateCcw,
} from "lucide-react";
import {
  ApiError,
  formatPrice,
  getPublicService,
  type PublicService,
} from "@/lib/services-api";

export default function ServiceDetails({ id }: { id: string }) {
  const [fetchState, setFetchState] = useState<{
    key: string;
    data: PublicService | null;
    error: string | null;
    notFound: boolean;
  }>({ key: "", data: null, error: null, notFound: false });
  const [retryCount, setRetryCount] = useState(0);

  const requestKey = `${id}|${retryCount}`;
  const isLoading = fetchState.key !== requestKey;
  const service = fetchState.data;
  const errorMessage = fetchState.error ?? "";
  const isNotFound = fetchState.notFound;
  const status = isLoading
    ? "loading"
    : errorMessage
      ? "error"
      : "success";

  useEffect(() => {
    const controller = new AbortController();

    getPublicService(id, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setFetchState({ key: requestKey, data, error: null, notFound: false });
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
          notFound: error instanceof ApiError && error.status === 404,
        });
      });

    return () => controller.abort();
  }, [id, requestKey]);

  if (status === "loading") {
    return (
      <div aria-busy="true" className="animate-pulse">
        <span className="sr-only">Loading service details</span>
        <div className="h-5 w-32 rounded bg-secondary" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="h-80 rounded-2xl bg-secondary sm:h-[440px]" />
          <div className="space-y-4">
            <div className="h-6 w-28 rounded bg-secondary" />
            <div className="h-10 w-4/5 rounded bg-secondary" />
            <div className="h-4 w-full rounded bg-secondary" />
            <div className="h-4 w-5/6 rounded bg-secondary" />
            <div className="h-4 w-2/3 rounded bg-secondary" />
            <div className="mt-8 h-24 rounded-2xl bg-secondary" />
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-border/80 bg-card p-10 text-center">
        <AlertCircle size={28} className="mx-auto text-error" />
        <h1 className="mt-4 font-serif text-2xl text-foreground">
          {isNotFound ? "Service not found" : "Couldn't load this service"}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
          {isNotFound
            ? "This service may no longer be available. Explore the rest of the collection instead."
            : errorMessage}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ArrowLeft size={15} />
            Back to services
          </Link>
          {!isNotFound && (
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <RotateCcw size={14} />
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!service) return null;

  return (
    <article>
      <Link
        href="/services"
        className="inline-flex items-center gap-2 rounded-full text-sm font-semibold text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft size={15} />
        Back to services
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-secondary">
          {service.images.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {service.images.map((image, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${service.title} image ${index + 1}`}
                  className={`h-64 w-full object-cover sm:h-72 ${
                    index === 0 ? "sm:col-span-2 sm:h-[340px]" : ""
                  }`}
                />
              ))}
            </div>
          ) : (
            <div
              role="img"
              aria-label="No image available"
              className="flex h-64 items-center justify-center text-muted/60 sm:h-[440px]"
            >
              <ImageOff size={36} strokeWidth={1.4} />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="w-fit rounded-full border border-border bg-secondary px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            {service.category}
          </span>

          <h1 className="mt-4 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
            {service.title}
          </h1>

          <p className="mt-3 flex items-center gap-2 text-sm text-muted">
            <MapPin size={16} className="shrink-0 text-accent" />
            {service.location || "Location not specified"}
          </p>

          <p className="mt-6 whitespace-pre-line text-sm leading-7 text-muted">
            {service.description}
          </p>

          <div className="mt-8 rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              {service.price > 0 ? "Starting price" : "Price"}
            </p>
            <p className="mt-1.5 font-serif text-2xl text-primary">
              {service.price > 0 ? formatPrice(service.price) : "On request"}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
