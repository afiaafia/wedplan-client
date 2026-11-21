import { cookies } from "next/headers";
import {
  CustomerApiError,
  getCustomerDashboard,
  getCustomerProfile,
} from "./customer-api.ts";
import type { CustomerDashboardData, CustomerProfile } from "./customer-dashboard.ts";

export type CustomerApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; status: number; code: string };

async function withSessionCookies<T>(
  request: (headers: Record<string, string>) => Promise<T>
): Promise<CustomerApiResult<T>> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  try {
    return { ok: true, data: await request({ Cookie: cookieHeader }) };
  } catch (error) {
    if (error instanceof CustomerApiError) {
      return {
        ok: false,
        message: error.message,
        status: error.status,
        code: error.code,
      };
    }

    return {
      ok: false,
      message: "The customer dashboard is temporarily unavailable.",
      status: 0,
      code: "UNKNOWN",
    };
  }
}

export function getCustomerDashboardForServer(): Promise<
  CustomerApiResult<CustomerDashboardData>
> {
  return withSessionCookies((headers) =>
    getCustomerDashboard({ headers })
  );
}

export function getCustomerProfileForServer(): Promise<
  CustomerApiResult<CustomerProfile>
> {
  return withSessionCookies((headers) => getCustomerProfile({ headers }));
}
