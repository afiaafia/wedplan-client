import Link from "next/link";
import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";

export default function ServiceDetailsError({
  status,
  message,
  onRetry,
}: {
  status: number | null;
  message: string;
  onRetry: () => void;
}) {
  const invalidId = status === 400;
  const notFound = status === 404;
  const title = invalidId
    ? "Invalid service link"
    : notFound
      ? "Service not found"
      : "Couldn't load this service";
  const description = invalidId
    ? "The service ID in this link isn't valid. Browse the collection to find the service you're looking for."
    : notFound
      ? "This service may no longer be available. Explore the rest of the collection instead."
      : message;

  return (
    <div className="rounded-[28px] border border-border/80 bg-card p-10 text-center shadow-sm">
      <AlertCircle size={28} className="mx-auto text-error" />
      <h1 className="mt-4 font-serif text-2xl text-foreground">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ArrowLeft size={15} />
          Back to services
        </Link>
        {!invalidId && !notFound && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <RotateCcw size={14} />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
