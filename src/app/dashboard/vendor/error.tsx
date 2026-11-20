"use client";

import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function VendorDashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 pb-12 pt-32 sm:px-6">
      <div className="w-full max-w-lg rounded-2xl border border-error/25 bg-card p-8 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
          <AlertCircle size={24} />
        </span>
        <h1 className="mt-5 font-serif text-2xl text-foreground">
          We couldn&apos;t load your dashboard
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
          Something went wrong while preparing your vendor overview. You can
          try again or return to the home page.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-muted/80">Reference: {error.digest}</p>
        )}

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <RotateCcw size={15} />
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
