export const USER_ROLES = ["customer", "vendor", "admin"] as const;

export const REGISTRATION_ROLES = ["customer", "vendor"] as const;

export const DEFAULT_ROLE = "customer";

export type UserRole = (typeof USER_ROLES)[number];

export type RegistrationRole = (typeof REGISTRATION_ROLES)[number];

export function isUserRole(value: unknown): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export function isRegistrationRole(value: unknown): value is RegistrationRole {
  return REGISTRATION_ROLES.includes(value as RegistrationRole);
}

export function normalizeRole(value: unknown): UserRole {
  return isUserRole(value) ? value : DEFAULT_ROLE;
}

export function getRoleDashboard(value: unknown): string {
  switch (normalizeRole(value)) {
    case "vendor":
      return "/dashboard/vendor";
    case "admin":
      return "/dashboard/admin";
    default:
      return "/dashboard/customer";
  }
}
