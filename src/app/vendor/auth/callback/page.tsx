import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { getRoleDashboard, normalizeRole } from "@/lib/roles";
import VendorAuthRejection from "@/components/auth/vendor-auth-rejection";

export const instant = false;

export const metadata = {
  title: "Verifying Vendor Account",
};

export default async function VendorAuthCallbackPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/vendor/sign-in?error=session_missing");
  }

  const role = normalizeRole(session.user.role);
  if (role !== "vendor" && role !== "admin") {
    return <VendorAuthRejection />;
  }

  redirect(getRoleDashboard(role));
}
