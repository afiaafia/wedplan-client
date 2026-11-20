"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LoaderCircle, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const base =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

      const result = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: new URL("/vendor/sign-in", base).toString(),
      });

      if (result.error) {
        setError(result.error.message || "Could not send reset instructions.");
        return;
      }

      setMessage("If an account exists for that email, reset instructions are on their way.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send reset instructions."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 pb-12 pt-32 sm:px-6">
      <div className="pointer-events-none absolute left-[-120px] top-40 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-10 right-[-100px] h-80 w-80 rounded-full bg-champagne/15 blur-[110px]" />

      <div className="relative z-10 w-full max-w-md rounded-[32px] border border-border/70 bg-card px-7 py-10 shadow-[0_25px_100px_rgba(48,39,42,0.09)] sm:px-10">
        <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
          <Mail size={21} />
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
          Account recovery
        </p>
        <h1 className="font-serif text-3xl text-foreground">Forgot Password?</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Enter your email and we&apos;ll send you instructions to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-foreground">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>

          {message && (
            <p role="status" className="rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
              {message}
            </p>
          )}

          {error && (
            <p role="alert" className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Please wait...
              </>
            ) : (
              <>
                Send Reset Instructions
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <Link
          href="/vendor/sign-in"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          <ArrowLeft size={16} />
          Back to Vendor Sign In
        </Link>
      </div>
    </main>
  );
}
