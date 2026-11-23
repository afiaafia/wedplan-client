import type { ReactNode } from "react";
import VendorSidebar from "./vendor-sidebar";
import type { VendorPlan } from "@/lib/subscription";

type VendorShellProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
    businessName?: string | null;
  };
  plan: VendorPlan;
  children: ReactNode;
};

export default function VendorShell({ user, plan, children }: VendorShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-50 top-40 h-96 w-96 rounded-full bg-accent/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 -right-30 h-96 w-96 rounded-full bg-champagne/15 blur-[120px]" />

      <VendorSidebar user={user} plan={plan} />

      <main className="relative z-10 px-4 pb-16 pt-[168px] sm:px-6 lg:pl-[320px] lg:pr-8 lg:pt-32">
        <div className="mx-auto max-w-350">{children}</div>
      </main>
    </div>
  );
}
