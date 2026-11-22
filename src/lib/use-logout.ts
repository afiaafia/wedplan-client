"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { signOut } from "@/lib/auth-client";
import { clearWedPlanBearerToken } from "./api-access-token";
import { useToast } from "@/components/layout/toast-provider";

export function useLogout() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const logout = useCallback(async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      clearWedPlanBearerToken();
      const result = await signOut();

      if (result?.error) {
        showToast({
          title: "Unable to sign out",
          description: result.error.message || "Please try again.",
          variant: "error",
        });
        return;
      }

      showToast({
        title: "Signed out",
        description: "You have been signed out successfully.",
        variant: "success",
      });
      router.replace("/");
      router.refresh();
    } catch {
      showToast({
        title: "Unable to sign out",
        description: "Please try again.",
        variant: "error",
      });
    } finally {
      setIsSigningOut(false);
    }
  }, [isSigningOut, router, showToast]);

  return { logout, isSigningOut };
}
