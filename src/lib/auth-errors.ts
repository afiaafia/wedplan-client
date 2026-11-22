export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  not_vendor:
    "This account does not have Vendor access yet. Sign in as a Customer and activate Vendor access from your dashboard.",
  session_missing: "We could not verify your session. Please try again.",
  blocked: "This account has been blocked. Please contact support.",
  access_denied: "Google sign-in was cancelled. Please try again if you wish to continue.",
};

export const AUTH_ERROR_CODES: Record<string, string> = {
  USER_ALREADY_EXISTS: "An account with this email already exists. Try signing in instead.",
  USER_EMAIL_ALREADY_EXISTS: "An account with this email already exists. Try signing in instead.",
  INVALID_REGISTRATION_ROLE: "Invalid account type. Choose Customer or Vendor and try again.",
  WEAK_PASSWORD: "Use at least 6 characters with one uppercase and one lowercase letter.",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters long.",
  PASSWORD_TOO_LONG: "Password must be at most 128 characters long.",
  ACCOUNT_BLOCKED: "This account has been blocked. Please contact support.",
  INVALID_EMAIL_PASSWORD: "The email or password you entered is incorrect.",
  INVALID_CREDENTIALS: "The email or password you entered is incorrect.",
  PROTECTED_PROFILE_FIELD: "That account field cannot be changed by the user.",
};

export function authErrorMessage(error: {
  code?: string;
  message?: string;
}): string {
  if (error.code && AUTH_ERROR_CODES[error.code]) {
    return AUTH_ERROR_CODES[error.code];
  }
  return error.message || "Something went wrong. Please try again.";
}

export function authQueryErrorMessage(
  code: string | null | undefined,
  description: string | null | undefined
): string {
  if (!code) return "";
  if (AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  if (description && /^[A-Za-z0-9 .,'!?-]{1,160}$/.test(description)) {
    return description;
  }
  return "Authentication could not be completed. Please try again.";
}
