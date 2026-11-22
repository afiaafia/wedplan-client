import type { UserRole } from "@/lib/roles";

export type VendorSignInDisposition =
  | "vendor"
  | "activate-vendor"
  | "admin"
  | "unsupported";

export function getVendorSignInDisposition(
  roles: readonly UserRole[]
): VendorSignInDisposition {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("vendor")) return "vendor";
  if (roles.includes("customer")) return "activate-vendor";
  return "unsupported";
}
