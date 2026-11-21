import { getServerApiBaseUrl } from "./api-url.ts";
import {
  createVendorApiError,
  messageForVendorApiError,
  parseVendorDashboardResponse,
  type VendorApiErrorCode,
} from "./vendor-api.ts";
import type { VendorOverview } from "./vendor-dashboard.ts";

export type VendorDashboardResult =
  | { ok: true; overview: VendorOverview }
  | {
      ok: false;
      message: string;
      status: number;
      code: VendorApiErrorCode;
    };

export async function requestVendorDashboard(
  cookieHeader: string,
  fetchImpl: typeof fetch = fetch
): Promise<VendorDashboardResult> {
  let response: Response;

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (cookieHeader) headers.Cookie = cookieHeader;

    response = await fetchImpl(`${getServerApiBaseUrl()}/api/vendor/dashboard`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      message:
        "We couldn't reach the server. Check your connection and try again.",
      status: 0,
      code: "NETWORK",
    };
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    return {
      ok: false,
      message: "The server returned an invalid response.",
      status: response.status,
      code: "INVALID_RESPONSE",
    };
  }

  if (!response.ok) {
    const error = createVendorApiError(
      body,
      response.status,
      "Unable to load your dashboard right now."
    );

    return {
      ok: false,
      message: messageForVendorApiError(error),
      status: error.status,
      code: error.code,
    };
  }

  try {
    return { ok: true, overview: parseVendorDashboardResponse(body) };
  } catch {
    return {
      ok: false,
      message: "The server returned an unexpected dashboard response.",
      status: response.status,
      code: "UNEXPECTED_RESPONSE",
    };
  }
}
