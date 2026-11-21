"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Save, X } from "lucide-react";
import { getSession } from "@/lib/auth-client";
import { useToast } from "@/components/layout/toast-provider";
import {
  getProfile,
  updateProfile,
  uploadProfileImage,
} from "@/lib/profile-api";
import type { UserRole } from "@/lib/roles";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function ProfileSettingsForm({
  initialName,
  initialBusinessName,
  initialImage,
  role,
}: {
  initialName: string;
  initialBusinessName: string;
  initialImage?: string | null;
  role: UserRole;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [name, setName] = useState(initialName);
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [imageUrl, setImageUrl] = useState<string | null>(initialImage ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    getProfile(controller.signal)
      .then((profile) => {
        if (!active) return;
        setName(profile.name || initialName);
        setBusinessName(profile.businessName || initialBusinessName);
        setImageUrl(profile.image ?? null);
      })
      .catch(() => {
        if (!active) return;
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [initialBusinessName, initialName]);

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

  function selectImage(file: File | null) {
    setError(null);
    setImageFailed(false);
    clearPreview();

    if (!file) {
      setImageFile(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Choose a valid image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Profile images must be 5MB or smaller.");
      return;
    }

    const preview = URL.createObjectURL(file);
    previewUrlRef.current = preview;
    setImagePreview(preview);
    setImageFile(file);
  }

  async function handleImageUpload() {
    if (!imageFile || isUploading) return;

    setIsUploading(true);
    setError(null);

    try {
      const profile = await uploadProfileImage(imageFile);
      setImageUrl(profile.image ?? null);
      setImageFile(null);
      clearPreview();
      showToast({
        title: "Profile image updated",
        description: "Your new photo is now visible.",
        variant: "success",
      });
      await getSession();
      router.refresh();
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "The image could not be uploaded.";
      setError(message);
      showToast({
        title: "Image upload failed",
        description: message,
        variant: "error",
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving || isUploading) return;

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await updateProfile({
        name: trimmedName,
        ...(role === "vendor"
          ? { businessName: businessName.trim() || null }
          : {}),
      });

      showToast({
        title: "Profile updated",
        description: "Your account details have been saved.",
        variant: "success",
      });
      await getSession();
      router.refresh();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "We couldn't save your changes.";
      setError(message);
      showToast({
        title: "Unable to save profile",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const displayedImage = imagePreview || (imageFailed ? null : imageUrl);

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border/80 bg-card p-6 shadow-[0_8px_30px_rgba(48,39,42,0.05)] sm:p-8"
    >
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-foreground">Profile photo</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-lg font-semibold text-primary">
              {displayedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayedImage}
                  alt="Profile preview"
                  onError={() => setImageFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                name.charAt(0).toUpperCase() || "U"
              )}
            </span>

            <div className="min-w-0 flex-1">
              <input
                ref={fileInputRef}
                id="profile-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => selectImage(event.target.files?.[0] || null)}
                className="text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-primary"
              />
              <p className="mt-2 text-xs text-muted">
                JPG, PNG, or WebP. Maximum 5MB. Uploaded to ImgBB through the secure WedPlan server.
              </p>
              {imageFile && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={isUploading || isSaving}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ImagePlus size={14} aria-hidden="true" />
                    {isUploading ? "Uploading..." : "Upload photo"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      clearPreview();
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted transition-colors hover:text-foreground disabled:opacity-60"
                  >
                    <X size={14} aria-hidden="true" />
                    Cancel
                  </button>
                </div>
              )}
              {imageUrl && !imageFile && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await updateProfile({ image: null });
                      setImageUrl(null);
                      await getSession();
                      router.refresh();
                      showToast({
                        title: "Profile photo removed",
                        variant: "success",
                      });
                    } catch (removeError) {
                      setError(
                        removeError instanceof Error
                          ? removeError.message
                          : "The photo could not be removed."
                      );
                    }
                  }}
                  className="mt-3 text-xs font-semibold text-muted underline underline-offset-2 hover:text-error"
                >
                  Remove current photo
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="profile-name" className="text-sm font-semibold text-foreground">
            Full name
          </label>
          <input
            id="profile-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            autoComplete="name"
            disabled={isLoading}
            className={fieldClass}
          />
        </div>

        {role === "vendor" && (
          <div>
            <label
              htmlFor="profile-business"
              className="text-sm font-semibold text-foreground"
            >
              Business name
            </label>
            <input
              id="profile-business"
              name="businessName"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              maxLength={150}
              placeholder="Your wedding business"
              disabled={isLoading}
              className={fieldClass}
            />
            <p className="mt-1.5 text-xs text-muted">
              This appears on the services listed under your account.
            </p>
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSaving || isUploading || isLoading}
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Save size={16} aria-hidden="true" />
        {isSaving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
