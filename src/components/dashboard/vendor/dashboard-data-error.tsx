"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, LogOut, RefreshCw } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import type { VendorOverviewError } from "@/lib/vendor-dashboard";

type DashboardDataErrorProps = {
  error: NonNullable<VendorOverviewError>;
  title: string;
  compact?: boolean;
};

export default function DashboardDataError({
  error,
  title,
  compact = false,
}: DashboardDataErrorProps) {
  const router = useRouter();
  const requiresNewSession =
    error.code === "VENDOR_ACCESS_REQUIRED" ||
    error.code === "ACCOUNT_BLOCKED" ||
    error.code === "FORBIDDEN";

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`rounded-xl border border-error/30 bg-error/10 text-error ${
        compact ? "px-4 py-4" : "px-5 py-6"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle size={17} className="mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs leading-5 opacity-90">{error.message}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-1.5 rounded-full border border-error/40 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-error/10"
            >
              <RefreshCw size={13} />
              Try again
            </button>
            {error.code === "UNAUTHORIZED" && (
              <Link
                href="/sign-in?redirect=/dashboard/vendor"
                className="inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-2"
              >
                Sign in again
                <ArrowRight size={13} />
              </Link>
            )}
            {requiresNewSession && (
              <button
                type="button"
                onClick={() => {
                  void signOut().finally(() => {
                    router.replace("/sign-in");
                    router.refresh();
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-error/40 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-error/10"
              >
                <LogOut size={13} />
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
