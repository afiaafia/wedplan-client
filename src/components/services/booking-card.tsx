"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CalendarCheck2,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  MapPin,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  getRoleDashboard,
  hasRole,
  normalizeRoles,
} from "@/lib/roles";
import { useActiveDashboardRole } from "@/lib/use-active-dashboard-role";
import { formatPrice, type ServiceDetail } from "@/lib/services-api";
import type { BookingConfirmation as BookingConfirmationData } from "@/lib/bookings-api";
import BookingConfirmation from "./booking-confirmation";
import BookingRequestForm from "./booking-request-form";

type Mode = "idle" | "form" | "confirmation";

export default function BookingCard({ service }: { service: ServiceDetail }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mode, setMode] = useState<Mode>("idle");
  const [confirmation, setConfirmation] =
    useState<BookingConfirmationData | null>(null);

  const user = session?.user;
  const roles = user ? normalizeRoles(user.roles, user.role) : [];
  const role = useActiveDashboardRole(
    session?.session?.id ?? null,
    roles.join("|"),
    "/services"
  );
  const canBookAsCustomer = user
    ? hasRole(user.roles, "customer", user.role)
    : false;
  const isBlocked = user?.isBlocked === true;
  const canBook = canBookAsCustomer && !isBlocked;

  function redirectToSignIn() {
    const target = `/services/${encodeURIComponent(service.id)}`;
    router.push(`/sign-in?redirect=${encodeURIComponent(target)}`);
  }

  return (
    <aside className="rounded-[28px] border border-border/80 bg-card/90 p-6 shadow-[0_18px_60px_rgba(48,39,42,0.08)] backdrop-blur-sm sm:p-7 lg:sticky lg:top-28 lg:self-start">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne">
        Booking
      </p>

      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="font-serif text-3xl text-primary">
          {service.price > 0 ? formatPrice(service.price) : "On request"}
        </p>
        {service.price > 0 && (
          <span className="text-[11px] text-muted">starting price</span>
        )}
      </div>

      <p className="mt-2 flex items-center gap-2 text-xs text-muted">
        <MapPin size={14} className="shrink-0 text-accent" />
        <span className="truncate">
          {service.location || "Location not specified"}
        </span>
      </p>

      {mode === "confirmation" && confirmation ? (
        <BookingConfirmation booking={confirmation} service={service} />
      ) : mode === "form" ? (
        <>
          <button
            type="button"
            onClick={() => setMode("idle")}
            className="mt-6 inline-flex items-center gap-2 rounded-full text-sm font-semibold text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ArrowLeft size={14} />
            Back to booking
          </button>
          <BookingRequestForm
            serviceId={service.id}
            onSuccess={(booking) => {
              setConfirmation(booking);
              setMode("confirmation");
            }}
          />
        </>
      ) : isPending ? (
        <div
          aria-busy="true"
          className="mt-6 flex items-center gap-2 rounded-xl bg-secondary/70 px-4 py-3 text-sm text-muted"
        >
          <Loader2 size={16} className="animate-spin" />
          Checking your session...
        </div>
      ) : !user ? (
        <>
          <p className="mt-6 text-sm leading-6 text-muted">
            Sign in as a customer to send a booking request to this vendor.
          </p>
          <button
            type="button"
            onClick={redirectToSignIn}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <LockKeyhole size={16} />
            Sign in to request booking
          </button>
        </>
      ) : !canBook ? (
        <div className="mt-6 rounded-2xl border border-border bg-secondary/60 p-4">
          <AlertCircle size={20} className="text-accent" />
          <p className="mt-2 text-sm font-semibold text-foreground">
            {isBlocked
              ? "Your account is blocked"
              : "Customer account required"}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            {isBlocked
              ? "You can't submit booking requests while your account is blocked."
              : "Vendors and admins can't submit customer booking requests."}
          </p>
          <Link
            href={role ? getRoleDashboard(role) : "/dashboard"}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Go to your dashboard
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm leading-6 text-muted">
            Share your event details and the vendor will review your request.
            You&apos;ll hear back once it&apos;s confirmed.
          </p>
          <button
            type="button"
            onClick={() => setMode("form")}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <CalendarCheck2 size={17} />
            Request booking
          </button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted">
            <CheckCircle2 size={13} className="text-success" />
            No payment required to send a request
          </p>
        </>
      )}
    </aside>
  );
}
