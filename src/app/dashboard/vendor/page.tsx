import type { Metadata } from "next";
import { redirect } from "next/navigation";
import VendorDashboard from "@/components/dashboard/vendor/vendor-dashboard";
import { requireRole } from "@/lib/auth-server";
import { resolveVendorPlan } from "@/lib/subscription";
import { getVendorDashboardForServer } from "@/lib/vendor-api-server";
import {
  EMPTY_VENDOR_OVERVIEW,
  type VendorOverviewError,
  type VendorServiceEditorAction,
} from "@/lib/vendor-dashboard";

type VendorDashboardPageProps = {
  searchParams: Promise<{
    subscription?: string | string[];
    service?: string | string[];
  }>;
};

export const instant = false;

export const metadata: Metadata = {
  title: "Vendor Dashboard",
  description: "Manage your wedding business on WedPlan.",
};

export default async function VendorDashboardPage({
  searchParams,
}: VendorDashboardPageProps) {
  const { role, user } = await requireRole(["vendor"]);
  const query = await searchParams;
  const subscription = Array.isArray(query.subscription)
    ? query.subscription[0]
    : query.subscription;
  const redirectStatus =
    subscription === "success" || subscription === "cancelled"
      ? subscription
      : null;
  const service = Array.isArray(query.service)
    ? query.service[0]
    : query.service;
  const editorAction: VendorServiceEditorAction = service
    ? service === "new"
      ? { kind: "create" }
      : { kind: "edit", id: service }
    : null;
  const plan = resolveVendorPlan(
    user.subscriptionPlan,
    user.subscriptionExpiresAt
  );

  const dashboard = await getVendorDashboardForServer();

  if (!dashboard.ok && (dashboard.code === "UNAUTHORIZED" || dashboard.status === 401)) {
    redirect("/sign-in?redirect=/dashboard/vendor");
  }

  const overviewError: VendorOverviewError = dashboard.ok
    ? null
    : { message: dashboard.message, code: dashboard.code };

  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <VendorDashboard
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
        businessName: user.businessName,
      }}
      role={role}
      plan={plan}
      redirectStatus={redirectStatus}
      currentDate={currentDate}
      overview={dashboard.ok ? dashboard.overview : EMPTY_VENDOR_OVERVIEW}
      overviewError={overviewError}
      editorAction={editorAction}
    />
  );
}
