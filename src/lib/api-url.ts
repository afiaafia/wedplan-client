export const LOCAL_API_URL = "http://localhost:5000";

export function normalizeApiBaseUrl(value: string | undefined): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    if (parsed.username || parsed.password) return null;
    if (parsed.search || parsed.hash) return null;

    return parsed.origin + (parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/+$/, ""));
  } catch {
    return null;
  }
}

export function getServerApiBaseUrl(
  env: Record<string, string | undefined> = process.env
): string {
  const configured = [
    env.API_INTERNAL_URL,
    env.BETTER_AUTH_URL,
    env.SERVER_URL,
    env.NEXT_PUBLIC_API_URL,
  ]
    .map(normalizeApiBaseUrl)
    .find((value): value is string => value !== null);

  return configured || LOCAL_API_URL;
}
