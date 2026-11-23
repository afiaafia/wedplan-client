import { toImageUploadPayload } from "./vendor-api.ts";
import type { UserRole } from "./roles.ts";

const PROFILE_API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export interface ProfileResponse {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  roles?: UserRole[];
  isBlocked?: boolean;
  image?: string | null;
  businessName?: string | null;
}

export class ProfileApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "ProfileApiError";
    this.status = status;
    this.code = code;
  }
}

function readErrorBody(body: unknown): { message?: string; code?: string } {
  if (typeof body !== "object" || body === null) return {};
  const error = (body as { error?: unknown }).error;
  if (typeof error !== "object" || error === null) return {};

  const record = error as { message?: unknown; code?: unknown };
  return {
    message: typeof record.message === "string" ? record.message : undefined,
    code: typeof record.code === "string" ? record.code : undefined,
  };
}

function messageForCode(code: string | undefined, fallback: string): string {
  switch (code) {
    case "UNAUTHORIZED":
    case "session_missing":
      return "Your session has expired. Please sign in again.";
    case "ACCOUNT_BLOCKED":
      return "Your account is blocked and cannot be updated.";
    case "VALIDATION_ERROR":
      return "Please check the details you entered and try again.";
    case "IMAGE_UPLOAD_UNAVAILABLE":
      return "Profile image uploads are not configured on the server.";
    case "IMAGE_UPLOAD_FAILED":
      return "The image could not be uploaded. Please try another file.";
    case "GOOGLE_SIGN_IN_REQUIRED":
      return "Sign in with Google before setting a password.";
    case "PASSWORD_ALREADY_SET":
      return "A password is already set for this account.";
    default:
      return fallback;
  }
}

async function requestProfileApi<TResponse extends object = ProfileResponse>(
  path: string,
  options: {
    method: "GET" | "PATCH" | "POST";
    body?: unknown;
    signal?: AbortSignal;
    fallbackMessage: string;
  }
): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${PROFILE_API_BASE_URL}${path}`, {
      method: options.method,
      credentials: "include",
      cache: "no-store",
      signal: options.signal,
      headers: {
        Accept: "application/json",
        ...(options.body === undefined
          ? {}
          : { "Content-Type": "application/json" }),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ProfileApiError(
      "We couldn't reach the server. Check your connection and try again.",
      0,
      "NETWORK"
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ProfileApiError(
      "The server returned an invalid response.",
      response.status,
      "INVALID_RESPONSE"
    );
  }

  if (!response.ok) {
    const details = readErrorBody(body);
    throw new ProfileApiError(
      messageForCode(details.code, details.message || options.fallbackMessage),
      response.status,
      details.code || "UNKNOWN"
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    (body as { success?: unknown }).success !== true ||
    typeof (body as { data?: unknown }).data !== "object" ||
    (body as { data?: unknown }).data === null
  ) {
    throw new ProfileApiError(
      "The server returned an unexpected response.",
      response.status,
      "INVALID_RESPONSE"
    );
  }

  return (body as { data: TResponse }).data;
}

export function getProfile(signal?: AbortSignal): Promise<ProfileResponse> {
  return requestProfileApi("/api/me", {
    method: "GET",
    signal,
    fallbackMessage: "Unable to load your profile.",
  });
}

export function activateVendorAccess(): Promise<ProfileResponse> {
  return requestProfileApi("/api/me/roles/vendor", {
    method: "POST",
    fallbackMessage: "Unable to activate Vendor access.",
  });
}

export function updateProfile(input: {
  name?: string;
  image?: string | null;
  businessName?: string | null;
}): Promise<ProfileResponse> {
  return requestProfileApi("/api/me", {
    method: "PATCH",
    body: input,
    fallbackMessage: "Unable to update your profile.",
  });
}

export function setProfilePassword(
  newPassword: string
): Promise<{ passwordSet: boolean }> {
  return requestProfileApi<{ passwordSet: boolean }>("/api/me/password", {
    method: "POST",
    body: { newPassword },
    fallbackMessage: "Unable to set a password for this account.",
  });
}

export async function uploadProfileImage(
  file: File,
  signal?: AbortSignal
): Promise<ProfileResponse> {
  const images = await toImageUploadPayload([file]);
  const image = images[0];
  if (!image) {
    throw new ProfileApiError(
      "Choose a valid image file.",
      0,
      "VALIDATION_ERROR"
    );
  }

  return requestProfileApi("/api/me/image", {
    method: "POST",
    body: { image },
    signal,
    fallbackMessage: "Unable to upload your profile image.",
  });
}
