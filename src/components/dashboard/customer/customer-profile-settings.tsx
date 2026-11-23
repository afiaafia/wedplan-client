"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2, Save, UserRound } from "lucide-react";
import { useToast } from "@/components/layout/toast-provider";
import { authClient } from "@/lib/auth-client";
import {
  uploadCustomerProfileImage,
  updateCustomerProfile,
  messageForCustomerApiError,
  validateProfileImage,
} from "@/lib/customer-api";
import { getCustomerInitials, type CustomerProfile } from "@/lib/customer-dashboard";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10";

export default function CustomerProfileSettings({
  profile,
}: {
  profile: CustomerProfile;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [name, setName] = useState(profile.name);
  const [image, setImage] = useState<string | null>(profile.image);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function clearPreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImagePreview(null);
  }

  async function handleNameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Please enter your name.");
      return;
    }

    setIsSaving(true);
    setNameError(null);

    try {
      const updated = await updateCustomerProfile(trimmedName);
      setName(updated.name);
      setImage(updated.image);
      await authClient.getSession();
      router.refresh();
      showToast({
        title: "Profile updated",
        description: "Your name has been saved.",
        variant: "success",
      });
    } catch (error) {
      setNameError(messageForCustomerApiError(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || isUploading) return;

    const validationError = validateProfileImage(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    const preview = URL.createObjectURL(file);
    previewUrlRef.current = preview;
    setImagePreview(preview);

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const updated = await uploadCustomerProfileImage(file, setUploadProgress);
      setImage(updated.image);
      clearPreview();
      await authClient.getSession();
      router.refresh();
      showToast({
        title: "Photo updated",
        description: "Your new profile photo is now visible.",
        variant: "success",
      });
    } catch (error) {
      clearPreview();
      setUploadError(messageForCustomerApiError(error));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-[0_8px_30px_rgba(48,39,42,0.05)] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xl font-semibold text-primary">
            {imagePreview || image ? (
              <Image
                src={imagePreview ?? image ?? ""}
                alt="Your profile"
                width={96}
                height={96}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              getCustomerInitials(name || profile.name)
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Profile photo</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              JPEG, PNG, GIF, or WebP up to 5 MB. Your image is uploaded securely
              and stored with your account.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(event) => void handleImageChange(event)}
              className="sr-only"
              aria-label="Choose a profile photo"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Camera size={14} />
              )}
              {isUploading ? `Uploading ${uploadProgress}%` : "Change photo"}
            </button>

            {uploadError && (
              <p role="alert" className="mt-3 text-xs text-error">
                {uploadError}
              </p>
            )}
          </div>
        </div>
      </section>

      <form
        onSubmit={handleNameSubmit}
        className="rounded-2xl border border-border/80 bg-card p-6 shadow-[0_8px_30px_rgba(48,39,42,0.05)] sm:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
            <UserRound size={19} />
          </span>
          <div>
            <h2 className="font-serif text-xl text-foreground">Account details</h2>
            <p className="mt-0.5 text-xs text-muted">{profile.email}</p>
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="customer-profile-name" className="text-sm font-semibold text-foreground">
            Full name
          </label>
          <input
            id="customer-profile-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            autoComplete="name"
            className={fieldClass}
          />
        </div>

        {nameError && (
          <p role="alert" className="mt-4 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
            {nameError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
