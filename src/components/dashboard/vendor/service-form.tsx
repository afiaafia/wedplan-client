"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, Loader2, Save } from "lucide-react";
import { SERVICE_CATEGORIES } from "@/lib/services-api";
import {
  createVendorApiError,
  createVendorService,
  messageForVendorApiError,
  toCreateServiceInput,
  toUpdateServiceInput,
  updateVendorService,
  uploadServiceImages,
  validateServiceForm,
  type ServiceFormErrors,
  type ServiceFormValues,
  type VendorApiError,
} from "@/lib/vendor-api";
import {
  formatServiceUsage,
  isActiveServiceLimitReached,
  type VendorPlan,
} from "@/lib/subscription";
import type { VendorService } from "@/lib/vendor-dashboard";

type ServiceFormProps = {
  mode: "create" | "edit";
  service?: VendorService;
  plan: VendorPlan;
  activeServices: number | null;
};

function initialValues(service?: VendorService): ServiceFormValues {
  return {
    title: service?.title ?? "",
    category: service?.category ?? SERVICE_CATEGORIES[0],
    description: service?.description ?? "",
    location: service?.location ?? "",
    price: service ? String(service.price) : "",
    images: service?.images.join("\n") ?? "",
    isActive: false,
  };
}

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-primary";

export default function ServiceForm({
  mode,
  service,
  plan,
  activeServices,
}: ServiceFormProps) {
  const router = useRouter();
  const submitting = useRef(false);
  const [values, setValues] = useState<ServiceFormValues>(() =>
    initialValues(service)
  );
  const [errors, setErrors] = useState<ServiceFormErrors>({});
  const [submitError, setSubmitError] = useState<{
    message: string;
    code: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const atLimit = isActiveServiceLimitReached(activeServices, plan);

  function update<K extends keyof ServiceFormValues>(
    field: K,
    value: ServiceFormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleImageUpload() {
    if (selectedImages.length === 0 || uploadingImages) return;

    setUploadingImages(true);
    setImageUploadError(null);

    try {
      const urls = await uploadServiceImages(selectedImages);
      setValues((current) => {
        const existing = current.images
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean);
        return {
          ...current,
          images: [...existing, ...urls].join("\n"),
        };
      });
      setErrors((current) => ({ ...current, images: undefined }));
      setSelectedImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setImageUploadError(
        error instanceof Error
          ? error.message
          : "Unable to upload these images right now."
      );
    } finally {
      setUploadingImages(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    const nextErrors = validateServiceForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitError(null);
      return;
    }

    submitting.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (mode === "edit" && service) {
        await updateVendorService(service.id, toUpdateServiceInput(values));
      } else {
        await createVendorService(toCreateServiceInput(values));
      }

      router.replace("/dashboard/vendor");
      router.refresh();
    } catch (error) {
      const apiError =
        error instanceof Error
          ? (error as VendorApiError)
          : createVendorApiError(null, 0, "Unable to save this service.");
      setSubmitError({
        message: messageForVendorApiError(apiError),
        code: apiError.code ?? "UNKNOWN",
      });
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-6 rounded-xl border border-border/70 bg-background/50 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg text-foreground">
            {mode === "edit" ? "Edit service" : "Create a service"}
          </h3>
          <p className="mt-1 text-xs leading-5 text-muted">
            {mode === "edit"
              ? "Update the details couples see. Availability is managed from your service list."
              : "New listings start with pending approval. Activation is managed from your service list."}
          </p>
        </div>
        <Link
          href="/dashboard/vendor"
          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-primary hover:text-primary"
        >
          Cancel
        </Link>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="service-title" className="text-xs font-semibold text-foreground">
            Title
          </label>
          <input
            id="service-title"
            value={values.title}
            onChange={(event) => update("title", event.target.value)}
            maxLength={120}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "service-title-error" : undefined}
            placeholder="e.g. Garden wedding photography"
            className={fieldClass}
          />
          {errors.title && (
            <p id="service-title-error" className="mt-1 text-xs text-error">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="service-category" className="text-xs font-semibold text-foreground">
            Category
          </label>
          <select
            id="service-category"
            value={values.category}
            onChange={(event) => update("category", event.target.value)}
            aria-invalid={Boolean(errors.category)}
            className={fieldClass}
          >
            {SERVICE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-error">{errors.category}</p>
          )}
        </div>

        <div>
          <label htmlFor="service-price" className="text-xs font-semibold text-foreground">
            Price (USD)
          </label>
          <input
            id="service-price"
            type="number"
            min="0"
            max="1000000"
            step="0.01"
            value={values.price}
            onChange={(event) => update("price", event.target.value)}
            aria-invalid={Boolean(errors.price)}
            placeholder="0.00"
            className={fieldClass}
          />
          {errors.price && (
            <p className="mt-1 text-xs text-error">{errors.price}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="service-location" className="text-xs font-semibold text-foreground">
            Location
          </label>
          <input
            id="service-location"
            value={values.location}
            onChange={(event) => update("location", event.target.value)}
            maxLength={150}
            aria-invalid={Boolean(errors.location)}
            placeholder="City, region, or service area"
            className={fieldClass}
          />
          {errors.location && (
            <p className="mt-1 text-xs text-error">{errors.location}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="service-description" className="text-xs font-semibold text-foreground">
            Description
          </label>
          <textarea
            id="service-description"
            rows={4}
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            maxLength={5000}
            aria-invalid={Boolean(errors.description)}
            placeholder="Describe what's included in this service"
            className={fieldClass}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-error">{errors.description}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="service-images" className="text-xs font-semibold text-foreground">
            Images <span className="font-normal text-muted">(optional)</span>
          </label>
          <p className="mt-1 text-xs leading-5 text-muted">
            Upload photos to hosted image storage, or paste hosted image URLs
            below (one per line). Uploaded URLs are saved with the service.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              aria-label="Choose service images"
              onChange={(event) => {
                setSelectedImages(Array.from(event.target.files ?? []));
                setImageUploadError(null);
              }}
              className="max-w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary"
            />
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={selectedImages.length === 0 || uploadingImages}
              className="rounded-full border border-primary px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadingImages ? "Uploading…" : "Upload images"}
            </button>
            {selectedImages.length > 0 && (
              <span className="text-xs text-muted">
                {selectedImages.length} selected
              </span>
            )}
          </div>
          {imageUploadError && (
            <p role="alert" className="mt-2 text-xs text-error">
              {imageUploadError}
            </p>
          )}
          <textarea
            id="service-images"
            rows={3}
            value={values.images}
            onChange={(event) => update("images", event.target.value)}
            aria-invalid={Boolean(errors.images)}
            placeholder="https://example.com/photo.jpg"
            className={`${fieldClass} mt-2`}
          />
          {errors.images && (
            <p className="mt-1 text-xs text-error">{errors.images}</p>
          )}
        </div>

        {mode === "create" && (
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2.5 text-xs leading-5 text-foreground">
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(event) => update("isActive", event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span>
                Activate this listing now
                <span className="block text-muted">
                  {formatServiceUsage(activeServices, plan)}. The backend confirms
                  availability before activation.
                </span>
              </span>
            </label>
          </div>
        )}
      </div>

      {mode === "create" && atLimit && plan === "free" && (
        <p className="mt-4 rounded-xl border border-champagne/30 bg-champagne/10 px-3.5 py-3 text-xs leading-5 text-champagne">
          You have reached the Free plan limit of 3 active services. Deactivate a
          service or upgrade to Premium before activating another.
        </p>
      )}

      {submitError && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-xl border border-error/30 bg-error/10 px-3.5 py-3 text-xs leading-5 text-error"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p>{submitError.message}</p>
            {submitError.code === "UNAUTHORIZED" && (
              <Link
                href="/sign-in?redirect=/dashboard/vendor"
                className="mt-2 inline-flex items-center gap-1 font-semibold underline underline-offset-2"
              >
                Sign in again
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save size={16} />
              {mode === "edit" ? "Save changes" : "Create service"}
            </>
          )}
        </button>
        <Link
          href="/dashboard/vendor"
          className="text-xs font-semibold text-muted transition-colors hover:text-primary"
        >
          Discard
        </Link>
      </div>
    </form>
  );
}
