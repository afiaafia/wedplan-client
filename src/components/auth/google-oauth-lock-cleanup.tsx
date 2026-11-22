"use client";

import { useEffect } from "react";
import { getSession } from "@/lib/auth-client";
import {
  finishGoogleOAuthFlow,
  isGoogleOAuthFlowPending,
} from "@/lib/google-oauth-flow";

export default function GoogleOAuthLockCleanup() {
  useEffect(() => {
    if (!isGoogleOAuthFlowPending()) return;

    let active = true;
    void getSession().then(
      (result) => {
        if (active && result.data?.user) finishGoogleOAuthFlow();
      },
      (error: unknown) => {
        console.error("Could not check the completed Google OAuth session", error);
      }
    );

    return () => {
      active = false;
    };
  }, []);

  return null;
}
