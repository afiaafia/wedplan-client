export const FREE_SERVICE_LIMIT = 3;
export const PREMIUM_PRICE_LABEL = "$10/month";

export const VENDOR_PLANS = ["free", "premium"] as const;

export type VendorPlan = (typeof VENDOR_PLANS)[number];

function isExpiredSubscription(value: unknown): boolean {
  const now = Date.now();

  if (value instanceof Date) {
    return value.getTime() <= now;
  }

  if (typeof value === "number") {
    return value <= now;
  }

  if (typeof value === "string") {
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) && timestamp <= now;
  }

  return false;
}

export function resolveVendorPlan(plan: unknown, expiresAt?: unknown): VendorPlan {
  if (plan !== "premium") return "free";
  if (isExpiredSubscription(expiresAt)) return "free";
  return "premium";
}

export function getServiceLimit(plan: VendorPlan): number | null {
  return plan === "premium" ? null : FREE_SERVICE_LIMIT;
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
  return `${count} of ${FREE_SERVICE_LIMIT} active services used · ${remaining} remaining`;
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
