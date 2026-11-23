import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { getSafePostAuthRedirect } from "@/lib/route-access";
import { resolvePostAuthDestination } from "@/lib/active-role";
import { normalizeRoles } from "@/lib/roles";
import AuthForm from "@/components/auth/auth-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your WedPlan account.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
}) {
  const session = await getServerSession();
  if (session) {
    const params = await searchParams;
    const roles = normalizeRoles(session.user.roles, session.user.role);
    const requestedPath = getSafePostAuthRedirect(
      typeof params.callbackURL === "string" ? params.callbackURL : null,
      typeof params.redirect === "string" ? params.redirect : null,
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      roles
    );
    redirect(resolvePostAuthDestination(roles, requestedPath).target);
  }

  return <AuthForm mode="sign-in" />;
}
