const UNSAFE_REDIRECT_CHARACTERS = /[\\\u0000-\u001F\u007F]/;

function hasUnsafeRedirectCharacters(value: string): boolean {
  if (UNSAFE_REDIRECT_CHARACTERS.test(value)) return true;

  try {
    return UNSAFE_REDIRECT_CHARACTERS.test(decodeURIComponent(value));
  } catch {
    return true;
  }
}

export function getSafeRedirectPath(
  value: string | null,
  baseUrl: string
): string | null {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    hasUnsafeRedirectCharacters(value)
  ) {
    return null;
  }

  try {
    const base = new URL(baseUrl);
    const target = new URL(value, base);

    if (
      target.origin !== base.origin ||
      !target.pathname.startsWith("/") ||
      target.pathname.startsWith("//")
    ) {
      return null;
    }

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return null;
  }
}
