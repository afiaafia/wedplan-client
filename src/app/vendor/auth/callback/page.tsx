import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { getSafeRedirectPath } from "@/lib/redirect-path";
import { isAllowedPostAuthDestination, isRouteAllowedForRole } from "@/lib/route-access";
import { getRoleDashboard, normalizeRoles } from "@/lib/roles";
import VendorAuthRejection from "@/components/auth/vendor-auth-rejection";

export const instant = false;

export const metadata = {
  title: "Verifying Vendor Account",
};

export default async function VendorAuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/vendor/sign-in?error=session_missing");
  }

  if (session.user.isBlocked === true) {
    redirect("/blocked");
  }

  const roles = normalizeRoles(session.user.roles, session.user.role);
  if (!roles.includes("vendor")) {
    return <VendorAuthRejection />;
  }

  const params = await searchParams;
  const requestedPath = getSafeRedirectPath(
    params.redirect ?? null,
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  );
  const target =
    requestedPath &&
    isAllowedPostAuthDestination(requestedPath) &&
    isRouteAllowedForRole(requestedPath, "vendor")
      ? requestedPath
      : getRoleDashboard("vendor");

  redirect(target);
}
