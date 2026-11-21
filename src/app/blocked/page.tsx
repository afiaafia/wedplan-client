import type { Metadata } from "next";
import BlockedAccount from "@/components/auth/blocked-account";

export const metadata: Metadata = {
  title: "Account Unavailable",
  description: "This WedPlan account has been blocked.",
};

export default function BlockedPage() {
  return <BlockedAccount />;
}
