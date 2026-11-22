export type BearerAuthHeaders = Record<string, string>;

let cachedToken: string | null = null;
let cachedExpiresAt = 0;

export async function getWedPlanBearerToken(): Promise<string | null> {
  if (cachedToken && Date.now() < cachedExpiresAt) return cachedToken;

  try {
    const response = await fetch("/api/me/token", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const body = await response.json();
    const token =
      body?.success === true && typeof body?.data?.accessToken === "string"
        ? body.data.accessToken
        : null;
    if (!token) return null;

    cachedToken = token;
    cachedExpiresAt = Date.now() + 12 * 60 * 1000;
    return token;
  } catch {
    return null;
  }
}

export async function getBearerAuthHeaders(
  headers: Record<string, string> = {}
): Promise<BearerAuthHeaders> {
  const token = await getWedPlanBearerToken();
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

export function clearWedPlanBearerToken(): void {
  cachedToken = null;
  cachedExpiresAt = 0;
}
