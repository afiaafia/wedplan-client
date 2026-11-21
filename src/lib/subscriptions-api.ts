import { isValidStripeCheckoutUrl } from "@/lib/subscription";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export type CheckoutErrorCode =
  | "UNAUTHORIZED"
  | "VENDOR_ACCESS_REQUIRED"
  | "ACCOUNT_BLOCKED"
  | "INVALID_CHECKOUT_URL"
  | "NETWORK"
  | "UNKNOWN";

export class CheckoutApiError extends Error {
  readonly status: number;
  readonly code: CheckoutErrorCode;

  constructor(message: string, code: CheckoutErrorCode, status: number) {
    super(message);
    this.name = "CheckoutApiError";
    this.status = status;
    this.code = code;
  }
}

function normalizeErrorCode(value: unknown, status: number): CheckoutErrorCode {
  if (value === "UNAUTHORIZED") return "UNAUTHORIZED";
  if (value === "VENDOR_ACCESS_REQUIRED") return "VENDOR_ACCESS_REQUIRED";
  if (value === "ACCOUNT_BLOCKED") return "ACCOUNT_BLOCKED";
  if (value === "INVALID_CHECKOUT_URL") return "INVALID_CHECKOUT_URL";
  if (status === 401) return "UNAUTHORIZED";
  return "UNKNOWN";
}

function readErrorDetails(body: unknown): { message?: string; code?: unknown } {
  if (!body || typeof body !== "object") return {};

  const error = (body as { error?: unknown }).error;
  if (!error || typeof error !== "object") return {};

  const value = error as { message?: unknown; code?: unknown };
  return {
    message: typeof value.message === "string" ? value.message : undefined,
    code: value.code,
  };
}

function errorMessageFor(code: CheckoutErrorCode, serverMessage?: string): string {
  switch (code) {
    case "UNAUTHORIZED":
      return "Your session has expired. Please sign in again before upgrading.";
    case "VENDOR_ACCESS_REQUIRED":
      return "Only vendor accounts can purchase WedPlan Premium.";
    case "ACCOUNT_BLOCKED":
      return "Your account is blocked and cannot start checkout. Please contact support.";
    case "INVALID_CHECKOUT_URL":
      return "Stripe did not return a valid checkout link. Please try again.";
    case "NETWORK":
      return "We couldn't reach the server. Check your connection and try again.";
    default:
      return serverMessage || "We couldn't start checkout. Please try again.";
  }
}

export async function createCheckoutSession(): Promise<string> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/subscriptions/checkout`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
  } catch {
    throw new CheckoutApiError(errorMessageFor("NETWORK"), "NETWORK", 0);
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new CheckoutApiError(
      "The server returned an invalid response.",
      "UNKNOWN",
      response.status
    );
  }

  if (!response.ok) {
    const details = readErrorDetails(body);
    const code = normalizeErrorCode(details.code, response.status);
    throw new CheckoutApiError(
      errorMessageFor(code, details.message),
      code,
      response.status
    );
  }

  const checkoutUrl = (body as { data?: { checkoutUrl?: unknown } })?.data
    ?.checkoutUrl;

  if (!isValidStripeCheckoutUrl(checkoutUrl)) {
    throw new CheckoutApiError(
      errorMessageFor("INVALID_CHECKOUT_URL"),
      "INVALID_CHECKOUT_URL",
      response.status
    );
  }

  return checkoutUrl;
}
