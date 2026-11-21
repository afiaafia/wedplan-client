import { type UserRole } from "./roles.ts";

type AccessRule = {
  prefix: string;
  roles: readonly UserRole[];
};

const ALL_ROLES: readonly UserRole[] = ["customer", "vendor", "admin"];

const ROUTE_RULES: readonly AccessRule[] = [
  { prefix: "/dashboard/customer", roles: ["customer"] },
  { prefix: "/dashboard/vendor", roles: ["vendor"] },
  { prefix: "/dashboard/admin", roles: ["admin"] },
  { prefix: "/settings", roles: ALL_ROLES },
  { prefix: "/dashboard", roles: ALL_ROLES },
];

export function isProtectedAppPath(pathname: string): boolean {
  return ROUTE_RULES.some(
    (rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)
  );
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
