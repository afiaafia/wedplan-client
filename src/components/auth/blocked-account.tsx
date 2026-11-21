"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { signOut } from "@/lib/auth-client";

export default function BlockedAccount() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    void signOut().finally(() => {
      if (active) {
        router.replace("/");
        router.refresh();
      }
    });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-error/10 text-error">
          <ShieldAlert size={22} aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-serif text-2xl text-foreground">
          Account unavailable
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Your account has been blocked. Signing out now. Please contact WedPlan
          support if you believe this is a mistake.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
