import { NextRequest, NextResponse } from "next/server";
import { getServerApiBaseUrl } from "@/lib/api-url";
import { getSafeRedirectPath } from "@/lib/redirect-path";
import {
  getRoleDashboard,
  normalizeRole,
  type UserRole,
} from "@/lib/roles";
import {
  isProtectedAppPath,
  isRouteAllowedForRole,
} from "@/lib/route-access";
import { hasValidSessionExpiry } from "@/lib/session-expiry";

const AUTH_PATHS = ["/sign-in", "/sign-up", "/vendor/sign-in"];
const ROLE_DASHBOARDS = [
  getRoleDashboard("customer"),
  getRoleDashboard("vendor"),
  getRoleDashboard("admin"),
];

type ProxySession = {
  session?: {
    expiresAt?: unknown;
  };
  user: {
    role?: unknown;
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
  const role: UserRole | null = session
    ? normalizeRole(session.user.role)
    : null;
  const roleDashboard = role ? getRoleDashboard(role) : null;
  const isBlocked = session?.user.isBlocked === true;

  if (isProtected && !session) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isProtected && isBlocked) {
    return NextResponse.redirect(new URL("/blocked", request.url));
  }

  if (isProtected && role && !isRouteAllowedForRole(pathname, role)) {
    return NextResponse.redirect(
      new URL(roleDashboard ?? getRoleDashboard(role), request.url)
    );
  }

  if (isAuthPath && session && !isBlocked && roleDashboard && role) {
    const requestedPath = getSafeRedirectPath(
      request.nextUrl.searchParams.get("redirect"),
      request.url
    );
    const target =
      requestedPath &&
      (!isRoleDashboardPath(requestedPath) ||
        isRouteAllowedForRole(requestedPath, role))
        ? requestedPath
        : roleDashboard;

    return NextResponse.redirect(new URL(target, request.url));
  }

  if (isAuthPath && isBlocked) {
    return NextResponse.redirect(new URL("/blocked", request.url));
  }

  return NextResponse.next();
}

function isRoleDashboardPath(path: string): boolean {
  return ROLE_DASHBOARDS.some(
    (base) => path === base || path.startsWith(`${base}/`)
  );
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

    return data;
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings",
    "/sign-in",
    "/sign-up",
    "/vendor/sign-in",
  ],
};
