export const FREE_SERVICE_LIMIT = 3;
export const PREMIUM_PRICE_LABEL = "$10/month";
export const FREE_PLAN_LIMIT_MESSAGE =
  "You've reached the Free plan limit of 3 active services. Deactivate a service or upgrade to Premium before activating another.";

export const VENDOR_PLANS = ["free", "premium"] as const;

export type VendorPlan = (typeof VENDOR_PLANS)[number];

function hasActiveSubscriptionExpiry(value: unknown): boolean {
  const now = Date.now();
  let timestamp: number;

  if (value instanceof Date) {
    timestamp = value.getTime();
  } else if (typeof value === "number") {
    timestamp = value;
  } else if (typeof value === "string" && value.trim() !== "") {
    timestamp = Date.parse(value);
  } else {
    return false;
  }

  return Number.isFinite(timestamp) && timestamp > now;
}

export function resolveVendorPlan(plan: unknown, expiresAt?: unknown): VendorPlan {
  if (plan !== "premium") return "free";
  return hasActiveSubscriptionExpiry(expiresAt) ? "premium" : "free";
}

export function getServiceLimit(plan: VendorPlan): number | null {
  return plan === "premium" ? null : FREE_SERVICE_LIMIT;
}

export function isActiveServiceLimitReached(
  activeServices: number | null,
  plan: VendorPlan
): boolean {
  const limit = getServiceLimit(plan);
  return (
    limit !== null &&
    typeof activeServices === "number" &&
    Number.isFinite(activeServices) &&
    activeServices >= limit
  );
}

export function formatServiceUsage(
  activeServices: number | null,
  plan: VendorPlan
): string {
  if (typeof activeServices !== "number" || !Number.isFinite(activeServices)) {
    return "Usage unavailable";
  }

  const count = Math.max(0, Math.trunc(activeServices));

  if (plan === "premium") {
    return `${count} active service${count === 1 ? "" : "s"}`;
  }

  const remaining = Math.max(0, FREE_SERVICE_LIMIT - count);
  return `${count} / ${FREE_SERVICE_LIMIT} active services used · ${remaining} remaining`;
}

export function isValidStripeCheckoutUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.toLowerCase() === "checkout.stripe.com"
    );
  } catch {
    return false;
  }
}
