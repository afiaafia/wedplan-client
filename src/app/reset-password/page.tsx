import { Suspense } from "react";
import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/reset-password-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a new WedPlan password.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="px-4 py-10 text-center text-sm text-muted">Loading reset form…</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
