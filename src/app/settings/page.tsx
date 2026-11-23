import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, UserRound } from "lucide-react";
import { requireSession } from "@/lib/auth-server";
import ProfileSettingsForm from "@/components/settings/profile-settings-form";
import { getPrimaryRole } from "@/lib/roles";

export const instant = false;

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Update your WedPlan account details.",
};

export default async function SettingsPage() {
  const { user } = await requireSession("/settings");

  const profileRole = getPrimaryRole(user.role, user.roles);

  if (profileRole === "customer") {
    redirect("/dashboard/customer/settings");
  }

  return (
    <main className="min-h-screen px-4 pb-20 pt-32 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to dashboard
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
            <UserRound size={20} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-serif text-3xl tracking-tight text-foreground">
              Profile Settings
            </h1>
            <p className="mt-1 text-sm text-muted">
              {user.email} &middot; {profileRole.charAt(0).toUpperCase() + profileRole.slice(1)}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <ProfileSettingsForm
            initialName={user.name}
            initialBusinessName={user.businessName ?? ""}
            initialImage={user.image ?? null}
            role={profileRole}
          />
        </div>
      </div>
    </main>
  );
}
