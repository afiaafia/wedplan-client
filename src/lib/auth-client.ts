import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:5000",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: ["customer", "vendor", "admin"],
          input: false,
        },
        roles: {
          type: "string[]",
          input: false,
        },
        isBlocked: {
          type: "boolean",
          input: false,
        },
        businessName: {
          type: "string",
          required: false,
          input: false,
        },
        subscriptionPlan: {
          type: ["free", "premium"],
          input: false,
        },
        subscriptionExpiresAt: {
          type: "date",
          required: false,
          input: false,
        },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
