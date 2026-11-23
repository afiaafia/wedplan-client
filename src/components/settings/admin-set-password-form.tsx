"use client";

import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { useToast } from "@/components/layout/toast-provider";
import { setProfilePassword } from "@/lib/profile-api";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10";

export default function AdminSetPasswordForm() {
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSet, setIsSet] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving || isSet) return;
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await setProfilePassword(password);
      setPassword("");
      setConfirmation("");
      setIsSet(true);
      showToast({
        title: "Password set",
        description: "You can now sign in with your email and password.",
        variant: "success",
      });
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Unable to set a password. Please try again.";
      setError(message);
      showToast({
        title: "Unable to set password",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border/80 bg-card p-6 shadow-[0_8px_30px_rgba(48,39,42,0.05)] sm:p-8"
    >
      <div className="flex items-center gap-2">
        <KeyRound size={18} aria-hidden="true" className="text-primary" />
        <h2 className="text-sm font-semibold text-foreground">
          Email and password sign-in
        </h2>
      </div>
      <p className="mt-2 text-sm text-muted">
        Sign in to this admin account with Google before setting a password.
        Your Google sign-in will continue to work.
      </p>

      {isSet ? (
        <p
          role="status"
          className="mt-5 rounded-xl bg-primary/10 px-4 py-3 text-sm text-foreground"
        >
          A password has been set for this account.
        </p>
      ) : (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="admin-new-password"
                className="text-sm font-semibold text-foreground"
              >
                New password
              </label>
              <input
                id="admin-new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={6}
                maxLength={128}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label
                htmlFor="admin-confirm-password"
                className="text-sm font-semibold text-foreground"
              >
                Confirm password
              </label>
              <input
                id="admin-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={6}
                maxLength={128}
                required
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">
            Use 6–128 characters, including at least one uppercase and one
            lowercase letter.
          </p>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-error/10 px-4 py-3 text-sm text-error"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Setting password..." : "Set password"}
          </button>
        </>
      )}
    </form>
  );
}
