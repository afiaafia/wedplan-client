import { type UserRole } from "./roles.ts";
import { getSafeRedirectPath } from "./redirect-path.ts";

type AccessRule = {
  prefix: string;
  roles: readonly UserRole[];
};

const ALL_ROLES: readonly UserRole[] = ["customer", "vendor", "admin"];

const ROUTE_RULES: readonly AccessRule[] = [
  { prefix: "/dashboard/customer", roles: ["customer"] },
  { prefix: "/dashboard/vendor", roles: ["vendor"] },
  { prefix: "/dashboard/admin", roles: ["admin"] },
  { prefix: "/vendor/onboarding", roles: ["customer", "vendor"] },
  { prefix: "/settings", roles: ALL_ROLES },
  { prefix: "/dashboard", roles: ALL_ROLES },
];

export function isProtectedAppPath(pathname: string): boolean {
  return (
    isServiceDetailPath(pathname) ||
    ROUTE_RULES.some(
      (rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)
    )
  );
}

export function isServiceDetailPath(pathname: string): boolean {
  return /^\/services\/[^/]+\/?$/.test(pathname);
}

export function isRouteAllowedForRole(
  pathname: string,
  role: UserRole
): boolean {
  const rule = ROUTE_RULES.find(
    (candidate) =>
      pathname === candidate.prefix || pathname.startsWith(`${candidate.prefix}/`)
  );

  return rule ? rule.roles.includes(role) : true;
}

export function isRouteAllowedForRoles(
  pathname: string,
  roles: readonly UserRole[]
): boolean {
  const rule = ROUTE_RULES.find(
    (candidate) =>
      pathname === candidate.prefix || pathname.startsWith(`${candidate.prefix}/`)
  );

  return rule ? rule.roles.some((role) => roles.includes(role)) : true;
}

const PUBLIC_SERVICE_PATH = /^\/services(?:\/[^/]+)?\/?$/;

export function isAllowedPostAuthDestination(path: string): boolean {
  const pathname = path.split(/[?#]/, 1)[0] ?? path;
  return isProtectedAppPath(pathname) || PUBLIC_SERVICE_PATH.test(pathname);
}

export function isAllowedPostAuthRedirect(
  path: string,
  role: UserRole
): boolean {
  const pathname = path.split(/[?#]/, 1)[0] ?? path;

  if (isProtectedAppPath(pathname)) {
    return isRouteAllowedForRole(pathname, role);
  }

  return PUBLIC_SERVICE_PATH.test(pathname);
}

export function isAllowedPostAuthRedirectForRoles(
  path: string,
  roles: readonly UserRole[]
): boolean {
  const pathname = path.split(/[?#]/, 1)[0] ?? path;
  const requestedDashboardRole = pathname.match(
    /^\/dashboard\/(customer|vendor|admin)(?:\/|$)/
  )?.[1];

  if (
    roles.includes("admin") &&
    requestedDashboardRole !== undefined &&
    requestedDashboardRole !== "admin"
  ) {
    return false;
  }

  if (isProtectedAppPath(pathname)) {
    return isRouteAllowedForRoles(pathname, roles);
  }

  return PUBLIC_SERVICE_PATH.test(pathname);
}

export function getSafePostAuthRedirect(
  callbackURL: string | null,
  redirect: string | null,
  baseUrl: string,
  roles: readonly UserRole[]
): string | null {
  const requestedPath = getSafeRedirectPath(callbackURL ?? redirect, baseUrl);

  return requestedPath && isAllowedPostAuthRedirectForRoles(requestedPath, roles)
    ? requestedPath
    : null;
}
