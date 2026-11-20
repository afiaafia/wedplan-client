import { NextRequest, NextResponse } from "next/server";
import { getRoleDashboard, normalizeRole } from "@/lib/roles";

const PROTECTED_PATHS = ["/dashboard"];
const AUTH_PATHS = ["/sign-in", "/sign-up", "/vendor/sign-in"];
const ROLE_DASHBOARDS = [
  getRoleDashboard("customer"),
  getRoleDashboard("vendor"),
  getRoleDashboard("admin"),
];

type ProxySession = {
  user: {
    role?: unknown;
  };
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isAuthPath = AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isProtected && !isAuthPath) {
    return NextResponse.next();
  }

  const session = await validateSession(request);
  const role = session ? normalizeRole(session.user.role) : null;
  const roleDashboard = role ? getRoleDashboard(role) : null;

  if (isProtected && !session) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (
    isProtected &&
    roleDashboard &&
    isRoleDashboardPath(pathname) &&
    !pathname.startsWith(roleDashboard)
  ) {
    return NextResponse.redirect(new URL(roleDashboard, request.url));
  }

  if (isAuthPath && session && roleDashboard) {
    const requestedPath = getSafeRedirectPath(
      request.nextUrl.searchParams.get("redirect")
    );
    const target =
      requestedPath &&
      (!isRoleDashboardPath(requestedPath) ||
        requestedPath.startsWith(roleDashboard))
        ? requestedPath
        : roleDashboard;

    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

function isRoleDashboardPath(path: string): boolean {
  return ROLE_DASHBOARDS.some(
    (base) => path === base || path.startsWith(base + "/")
  );
}

function getSafeRedirectPath(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  return value;
}

async function validateSession(request: NextRequest): Promise<ProxySession | null> {
  const backendUrl =
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    "http://localhost:5000";

  try {
    const cookieHeader = request.headers.get("cookie") || "";

    const response = await fetch(`${backendUrl}/api/auth/get-session`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) return null;

    const data: ProxySession | null = await response.json();
    if (!data?.user) return null;

    return data;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up", "/vendor/sign-in"],
};
