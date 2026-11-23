import { NextRequest, NextResponse } from "next/server";
import { getServerApiBaseUrl } from "@/lib/api-url";
import {
  getDashboardEntryPath,
  getDefaultDashboardRole,
  getRoleDashboard,
  normalizeRoles,
} from "@/lib/roles";
import {
  isProtectedAppPath,
  getSafePostAuthRedirect,
  isRouteAllowedForRoles,
} from "@/lib/route-access";
import { getVendorSignInDisposition } from "@/lib/vendor-auth";
import { hasValidSessionExpiry } from "@/lib/session-expiry";

const AUTH_PATHS = ["/sign-in", "/sign-up", "/vendor/sign-in"];

type ProxySession = {
  session?: {
    expiresAt?: unknown;
  };
  user: {
    role?: unknown;
    roles?: unknown;
    isBlocked?: unknown;
  };
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = isProtectedAppPath(pathname);
  const isAuthPath = AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!isProtected && !isAuthPath) {
    return NextResponse.next();
  }

  const session = await validateSession(request);
  const roles = session
    ? normalizeRoles(session.user.roles, session.user.role)
    : [];
  const dashboardEntry = getDashboardEntryPath(roles);
  const isBlocked = session?.user.isBlocked === true;

  if (isProtected && !session) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set(
      "callbackURL",
      `${pathname}${request.nextUrl.search}`
    );
    return NextResponse.redirect(signInUrl);
  }

  if (isProtected && isBlocked) {
    return NextResponse.redirect(new URL("/blocked", request.url));
  }

  if (isProtected && roles.length > 0 && !isRouteAllowedForRoles(pathname, roles)) {
    return NextResponse.redirect(
      new URL(dashboardEntry, request.url)
    );
  }

  if (
    isAuthPath &&
    pathname === "/vendor/sign-in" &&
    session &&
    !isBlocked
  ) {
    const disposition = getVendorSignInDisposition(roles);
    if (disposition === "activate-vendor") {
      return NextResponse.redirect(
        new URL("/vendor/auth/callback", request.url)
      );
    }
    if (disposition === "admin") {
      return NextResponse.redirect(
        new URL(getRoleDashboard("admin"), request.url)
      );
    }
  }

  const authDashboardRole = roles.includes("admin")
    ? "admin"
    : pathname === "/vendor/sign-in" && roles.includes("vendor")
      ? "vendor"
      : getDefaultDashboardRole(roles);
  const authDashboard = authDashboardRole
    ? getRoleDashboard(authDashboardRole)
    : "/dashboard";
  const defaultAuthTarget =
    roles.includes("admin")
      ? getRoleDashboard("admin")
      : pathname === "/sign-up" &&
          request.nextUrl.searchParams.get("role") === "vendor" &&
          roles.includes("customer")
        ? roles.includes("vendor")
          ? getRoleDashboard("vendor")
          : "/vendor/onboarding"
        : authDashboard;

  if (isAuthPath && session && !isBlocked && defaultAuthTarget) {
    const requestedPath = getSafePostAuthRedirect(
      request.nextUrl.searchParams.get("callbackURL"),
      request.nextUrl.searchParams.get("redirect"),
      request.url,
      roles
    );
    const target = requestedPath ?? defaultAuthTarget;

    return NextResponse.redirect(new URL(target, request.url));
  }

  if (isAuthPath && isBlocked) {
    return NextResponse.redirect(new URL("/blocked", request.url));
  }

  return NextResponse.next();
}

async function validateSession(
  request: NextRequest
): Promise<ProxySession | null> {
  const backendUrl = getServerApiBaseUrl();

  try {
    const cookieHeader = request.headers.get("cookie") || "";

    const response = await fetch(`${backendUrl}/api/auth/get-session`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data: ProxySession | null = await response.json();
    if (!data?.user) return null;
    if (!hasValidSessionExpiry(data.session?.expiresAt)) return null;
    if (
      Array.isArray(data.user.roles) &&
      normalizeRoles(data.user.roles, data.user.role).length === 0
    ) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/services/:path*",
    "/vendor/onboarding/:path*",
    "/settings",
    "/sign-in",
    "/sign-up",
    "/vendor/sign-in",
  ],
};
