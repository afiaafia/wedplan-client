import type { Metadata } from "next";
import {
  Heart,
  CalendarDays,
  Users,
  Star,
  LayoutDashboard,
} from "lucide-react";
import { requireRole } from "@/lib/auth-server";
import { RoleDashboard } from "@/components/dashboard/role-dashboard";

export const instant = false;

export const metadata: Metadata = {
  title: "Customer Dashboard",
  description: "Plan your wedding on WedPlan.",
};

export default async function CustomerDashboardPage() {
  const { user } = await requireRole(["customer"]);

  return (
    <RoleDashboard
      user={user}
      eyebrow="Couple dashboard"
      title="Welcome back"
      description="Discover trusted wedding professionals and keep every detail of your celebration in one beautiful place."
      cards={[
        {
          icon: <Heart size={22} />,
          title: "My Wedding",
          description: "Track your overall planning progress and key milestones.",
          href: "#",
          comingSoon: true,
        },
        {
          icon: <CalendarDays size={22} />,
          title: "Timeline",
          description: "Stay on top of every task and deadline leading up to your big day.",
          href: "#",
          comingSoon: true,
        },
        {
          icon: <Users size={22} />,
          title: "Vendors",
          description: "Browse, compare, and manage your chosen wedding professionals.",
          href: "/services",
        },
        {
          icon: <Star size={22} />,
          title: "Favourites",
          description: "Revisit vendors and ideas you've saved for later.",
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
