import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth-server";
import CustomerShell from "@/components/dashboard/customer/customer-shell";

export const instant = false;

export default async function CustomerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await requireRole(["customer"]);
  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <CustomerShell
      user={{ name: user.name, email: user.email, image: user.image ?? null }}
      currentDate={currentDate}
      title="Your wedding, beautifully organised"
      description="Review your booking requests, discover trusted professionals, and keep every detail in one place."
    >
      {children}
    </CustomerShell>
  );
}
