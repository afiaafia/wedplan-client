import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerApiBaseUrl } from "@/lib/api-url";
import { getRoleDashboard, normalizeRole, type UserRole } from "@/lib/roles";
import { hasValidSessionExpiry } from "@/lib/session-expiry";
import type { VendorPlan } from "@/lib/subscription";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  businessName?: string | null;
  role: UserRole;
  isBlocked?: boolean;
  subscriptionPlan?: VendorPlan | null;
  subscriptionExpiresAt?: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SessionData = {
  session: {
    id: string;
    userId: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: SessionUser;
};

export async function getServerSession(): Promise<SessionData | null> {
  const backendUrl = getServerApiBaseUrl();

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const response = await fetch(`${backendUrl}/api/auth/get-session`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data: SessionData | null = await response.json();
    if (!data || !data.session || !data.user) {
      return null;
    }

    if (!hasValidSessionExpiry(data.session.expiresAt)) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export const verifySession = cache(getServerSession);

export async function requireSession(redirectTo?: string): Promise<SessionData> {
  const session = await verifySession();

  if (!session) {
    const query = redirectTo
      ? `?redirect=${encodeURIComponent(redirectTo)}`
      : "";
    redirect(`/sign-in${query}`);
  }

  return session;
}

export async function requireRole(allowedRoles: readonly UserRole[]): Promise<{
  session: SessionData;
  user: SessionUser;
  role: UserRole;
}> {
  const session = await requireSession();
  const role = normalizeRole(session.user.role);

  if (!allowedRoles.includes(role)) {
    redirect(getRoleDashboard(role));
  }

  return { session, user: session.user, role };
}
