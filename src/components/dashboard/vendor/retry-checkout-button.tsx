"use client";

import { useRef, useState } from "react";
import { Crown, Loader2 } from "lucide-react";
import { useToast } from "@/components/layout/toast-provider";
import { CheckoutApiError, createCheckoutSession } from "@/lib/subscriptions-api";

export default function RetryCheckoutButton() {
  const { showToast } = useToast();
  const inFlight = useRef(false);
  const [starting, setStarting] = useState(false);

  async function retry() {
    if (inFlight.current || starting) return;
    inFlight.current = true;
    setStarting(true);

    try {
      const url = await createCheckoutSession();
      window.location.assign(url);
    } catch (error) {
      showToast({
        title: "Unable to restart checkout",
        description:
          error instanceof CheckoutApiError
            ? error.message
            : "Please try again in a moment.",
        variant: "error",
      });
      inFlight.current = false;
      setStarting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void retry()}
      disabled={starting}
      aria-busy={starting}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {starting ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Crown size={15} />
      )}
      {starting ? "Creating checkout…" : "Retry payment"}
    </button>
  );
}
