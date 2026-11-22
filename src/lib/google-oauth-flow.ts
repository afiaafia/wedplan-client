const GOOGLE_OAUTH_LOCK_KEY = "wedplan.google-oauth.pending-until";
const GOOGLE_OAUTH_SESSION_KEY = "wedplan.google-oauth.started";
export const GOOGLE_OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

type OAuthLockStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function claimGoogleOAuthFlow(
  storage: OAuthLockStorage,
  now: number = Date.now()
): string | null {
  const pendingUntil = getExpiry(storage.getItem(GOOGLE_OAUTH_LOCK_KEY));
  if (Number.isFinite(pendingUntil) && pendingUntil > now) return null;

  const nextExpiry = now + GOOGLE_OAUTH_STATE_TTL_MS;
  const lockValue = `${nextExpiry}:${Math.random().toString(36).slice(2)}`;
  storage.setItem(GOOGLE_OAUTH_LOCK_KEY, lockValue);
  return storage.getItem(GOOGLE_OAUTH_LOCK_KEY) === lockValue ? lockValue : null;
}

export function hasPendingGoogleOAuthFlow(
  storage: OAuthLockStorage,
  now: number = Date.now()
): boolean {
  const pendingUntil = getExpiry(storage.getItem(GOOGLE_OAUTH_LOCK_KEY));
  return Number.isFinite(pendingUntil) && pendingUntil > now;
}

function getExpiry(lockValue: string | null): number {
  if (!lockValue) return Number.NaN;
  return Number(lockValue.split(":", 1)[0]);
}

export function clearGoogleOAuthFlow(
  storage: OAuthLockStorage,
  expectedLockValue?: string
): void {
  if (
    expectedLockValue === undefined ||
    storage.getItem(GOOGLE_OAUTH_LOCK_KEY) === expectedLockValue
  ) {
    storage.removeItem(GOOGLE_OAUTH_LOCK_KEY);
  }
}

export type GoogleOAuthLockResult = "started" | "pending" | "unavailable";

export function startGoogleOAuthFlow(): GoogleOAuthLockResult {
  if (typeof window === "undefined") return "unavailable";
  let lockValue: string | null = null;
  try {
    lockValue = claimGoogleOAuthFlow(window.localStorage);
    if (!lockValue) return "pending";
    window.sessionStorage.setItem(GOOGLE_OAUTH_SESSION_KEY, lockValue);
    return "started";
  } catch {
    try {
      if (lockValue) clearGoogleOAuthFlow(window.localStorage, lockValue);
    } catch {
      // Storage is unavailable; the sign-in handler reports this to the user.
    }
    return "unavailable";
  }
}

export function isGoogleOAuthFlowPending(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const lockValue = window.sessionStorage.getItem(GOOGLE_OAUTH_SESSION_KEY);
    return (
      lockValue !== null &&
      window.localStorage.getItem(GOOGLE_OAUTH_LOCK_KEY) === lockValue &&
      hasPendingGoogleOAuthFlow(window.localStorage)
    );
  } catch {
    return false;
  }
}

export function finishGoogleOAuthFlow(): void {
  if (typeof window === "undefined") return;
  const lockValue = window.sessionStorage.getItem(GOOGLE_OAUTH_SESSION_KEY);
  window.sessionStorage.removeItem(GOOGLE_OAUTH_SESSION_KEY);
  if (lockValue) clearGoogleOAuthFlow(window.localStorage, lockValue);
}
