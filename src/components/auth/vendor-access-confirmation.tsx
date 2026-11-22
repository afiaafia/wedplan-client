"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Briefcase, LoaderCircle } from "lucide-react";
import { useToast } from "@/components/layout/toast-provider";
import { getSession } from "@/lib/auth-client";
import { activateVendorAccess } from "@/lib/profile-api";
import { normalizeRoles } from "@/lib/roles";

type ConfirmationSource = "google" | "email" | "account";

export default function VendorAccessConfirmation({
  source,
}: {
  source: ConfirmationSource;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleActivation() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const result = await activateVendorAccess();
      if (!result.roles?.includes("vendor")) {
        throw new Error("Vendor access was not confirmed. Please try again.");
      }

      const sessionResult = await getSession();
      const roles = normalizeRoles(
        sessionResult.data?.user.roles,
        sessionResult.data?.user.role
      );
      if (!roles.includes("vendor")) {
        throw new Error("Vendor access was not confirmed. Please sign in again.");
      }

      showToast({
        title: "Vendor access activated",
        description: "You can now use your Vendor dashboard with this account.",
        variant: "success",
      });
      router.replace("/dashboard/vendor");
      router.refresh();
    } catch (activationError) {
      const message =
        activationError instanceof Error
          ? activationError.message
          : "Unable to activate Vendor access.";
      setError(message);
      showToast({
        title: "Vendor access not activated",
        description: message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.replace("/dashboard/customer");
    router.refresh();
  }

  const confirmationMessage =
    source === "google"
      ? "Your Google account already has a WedPlan Customer profile. You can use the same account to access Vendor features."
      : "Your WedPlan account already has a Customer profile. You can use the same account to access Vendor features.";

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-secondary/35 px-4 py-16">
      <section
        aria-labelledby="vendor-access-title"
        className="w-full max-w-lg rounded-3xl border border-border bg-card p-7 shadow-lg sm:p-10"
      >
        <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
          <Briefcase size={22} aria-hidden="true" />
        </span>
        <h1
          id="vendor-access-title"
          className="font-serif text-3xl text-foreground"
        >
          Use your existing account
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {confirmationMessage}
        </p>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-error/25 bg-error/5 p-3 text-sm text-error"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleActivation}
          disabled={loading}
          className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
              Activating Vendor access...
            </>
          ) : (
            <>
              Activate Vendor Access
              <ArrowRight size={17} aria-hidden="true" />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="mt-3 h-12 w-full rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
      </section>
    </main>
  );
}
