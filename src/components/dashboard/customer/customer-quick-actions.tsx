import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  CalendarPlus,
  ClipboardList,
  UserRound,
} from "lucide-react";
import DashboardSection from "@/components/dashboard/vendor/dashboard-section";

export default function CustomerQuickActions({
  hasVendorAccess,
}: {
  hasVendorAccess: boolean;
}) {
  const actions = [
    {
      title: "Browse services",
      description: "Find photographers, florists, venues, and more.",
      href: "/services",
      icon: <CalendarPlus size={19} />,
    },
    {
      title: "My bookings",
      description: "Review every request and its current status.",
      href: "/dashboard/customer/bookings",
      icon: <ClipboardList size={19} />,
    },
    {
      title: "Profile settings",
      description: "Update your name and profile photo.",
      href: "/dashboard/customer/settings",
      icon: <UserRound size={19} />,
    },
    {
      title: hasVendorAccess ? "Vendor dashboard" : "Become a Vendor",
      description: hasVendorAccess
        ? "Manage your services and bookings."
        : "Activate Vendor access for this account.",
      href: hasVendorAccess ? "/dashboard/vendor" : "/vendor/onboarding",
      icon: <Briefcase size={19} />,
    },
  ];

  return (
    <DashboardSection
      icon={<ClipboardList size={19} />}
      title="Quick actions"
      description="The most useful places to continue planning."
    >
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-start gap-3 rounded-xl border border-border/70 bg-background/60 p-4 transition-colors hover:border-accent/50 hover:bg-secondary/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              {action.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">
                {action.title}
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted">
                {action.description}
              </span>
            </span>
            <ArrowUpRight
              size={16}
              className="mt-1 shrink-0 text-muted transition-colors group-hover:text-primary"
            />
          </Link>
        ))}
      </div>
    </DashboardSection>
  );
}
