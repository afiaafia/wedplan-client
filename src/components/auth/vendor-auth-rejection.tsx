"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { signOut } from "@/lib/auth-client";

export default function VendorAuthRejection() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    void signOut().finally(() => {
      if (active) {
        router.replace("/vendor/sign-in?error=not_vendor");
        router.refresh();
      }
    });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4 text-sm text-muted shadow-sm">
        <LoaderCircle size={18} className="animate-spin text-primary" />
        Verifying your account...
      </div>
    </main>
  );
}
