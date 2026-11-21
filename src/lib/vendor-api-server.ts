import { cookies } from "next/headers";
import {
  requestVendorDashboard,
  type VendorDashboardResult,
} from "./vendor-dashboard-request.ts";

export type { VendorDashboardResult } from "./vendor-dashboard-request.ts";

export async function getVendorDashboardForServer(): Promise<VendorDashboardResult> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  return requestVendorDashboard(cookieHeader);
}
