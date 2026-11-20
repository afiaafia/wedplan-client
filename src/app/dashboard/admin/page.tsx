import type { Metadata } from "next";
import {
  Users,
  ShieldCheck,
  Flag,
  Activity,
  LayoutDashboard,
} from "lucide-react";
import { requireRole } from "@/lib/auth-server";
import { RoleDashboard } from "@/components/dashboard/role-dashboard";

export const instant = false;

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Oversee the WedPlan platform.",
};

export default async function AdminDashboardPage() {
  const { user } = await requireRole(["admin"]);

  return (
    <RoleDashboard
      user={user}
      eyebrow="Administrator dashboard"
      title="Welcome back"
      description="Oversee the WedPlan platform, manage users and vendors, and ensure a world-class experience for everyone."
      cards={[
        {
          icon: <Users size={22} />,
          title: "Users",
          description: "Review customer and vendor accounts across the platform.",
          href: "#",
          comingSoon: true,
        },
        {
          icon: <ShieldCheck size={22} />,
          title: "Verification",
          description: "Approve and manage vendor verification requests.",
          href: "#",
          comingSoon: true,
        },
        {
          icon: <Flag size={22} />,
          title: "Moderation",
          description: "Handle reported content and account issues.",
          href: "#",
          comingSoon: true,
        },
        {
          icon: <Activity size={22} />,
          title: "Platform Health",
          description: "Monitor activity and overall platform performance.",
          href: "#",
          comingSoon: true,
        },
        {
          icon: <LayoutDashboard size={22} />,
          title: "Profile Settings",
          description: "Update your account details, photo, and preferences.",
          href: "#",
          comingSoon: true,
        },
      ]}
    />
  );
}
