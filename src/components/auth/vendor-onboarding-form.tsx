"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Briefcase, LoaderCircle } from "lucide-react";
import { activateVendorAccess } from "@/lib/profile-api";
import { useToast } from "@/components/layout/toast-provider";

export default function VendorOnboardingForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const result = await activateVendorAccess();
      if (!result.roles?.includes("vendor")) {
        throw new Error("Vendor access was not confirmed. Please try again.");
      }

      showToast({
        title: "Vendor access activated",
        description: "Your account can now use both Customer and Vendor dashboards.",
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
        title: "Onboarding failed",
        description: message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-10"
    >
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
        <Briefcase size={22} />
      </span>
      <h1 className="font-serif text-3xl text-foreground">
        Add Vendor access
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        This securely adds Vendor capabilities to your existing WedPlan account.
        Your email, password, Google connection, and Customer access stay the same.
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
        type="submit"
        disabled={loading}
        className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <LoaderCircle size={18} className="animate-spin" />
            Activating Vendor access...
          </>
        ) : (
          <>
            Activate Vendor access
            <ArrowRight size={17} />
          </>
        )}
      </button>
    </form>
  );
}
