import { BadgeCheck, Building2, Mail, UserRound } from "lucide-react";
import { getInitials } from "@/lib/vendor-dashboard";

type BusinessSummaryProps = {
  name: string;
  email: string;
  image?: string | null;
  businessName?: string | null;
};

export default function BusinessSummary({
  name,
  email,
  image,
  businessName,
}: BusinessSummaryProps) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
        Your account
      </p>
      <h2 className="mt-2 font-serif text-xl text-foreground">
        Business summary
      </h2>

      <div className="mt-5 flex items-center gap-4 rounded-xl border border-border/70 bg-background/60 p-4">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name || "Vendor profile"}
            className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-sm"
          />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white shadow-md shadow-primary/20">
            {getInitials(name)}
          </span>
        )}

        <div className="min-w-0">
          <p className="truncate font-serif text-lg text-foreground">
            {businessName?.trim() || "Business name not provided"}
          </p>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary">
            <BadgeCheck size={13} />
            Vendor account
          </span>
        </div>
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <UserRound size={16} className="mt-0.5 shrink-0 text-accent" />
          <div className="min-w-0">
            <dt className="text-xs font-medium text-muted">Vendor name</dt>
            <dd className="truncate font-medium text-foreground">
              {name || "Not provided"}
            </dd>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Mail size={16} className="mt-0.5 shrink-0 text-accent" />
          <div className="min-w-0">
            <dt className="text-xs font-medium text-muted">Email address</dt>
            <dd className="truncate font-medium text-foreground">{email}</dd>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Building2 size={16} className="mt-0.5 shrink-0 text-accent" />
          <div className="min-w-0">
            <dt className="text-xs font-medium text-muted">Business name</dt>
            <dd className="truncate font-medium text-foreground">
              {businessName?.trim() || "Not provided"}
            </dd>
          </div>
        </div>
      </dl>

      <p className="mt-5 border-t border-border/70 pt-4 text-xs leading-5 text-muted">
        Account details come from your authenticated WedPlan session. Business
        verification status is not part of the current account data.
      </p>
    </section>
  );
}
