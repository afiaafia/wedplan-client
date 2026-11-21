export interface SocialLink {
  label: string;
  href: string;
  icon: "instagram" | "facebook" | "pinterest" | "x";
}

function httpUrl(value: string | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function emailLink(value: string | undefined): string | null {
  if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return null;
  return `mailto:${value.trim()}`;
}

export function getFooterContact(): { email: string | null; socials: SocialLink[] } {
  const socials: SocialLink[] = [];

  const candidates: Array<[string, string | undefined, SocialLink["icon"]]> = [
    ["Instagram", process.env.NEXT_PUBLIC_INSTAGRAM_URL, "instagram"],
    ["Facebook", process.env.NEXT_PUBLIC_FACEBOOK_URL, "facebook"],
    ["Pinterest", process.env.NEXT_PUBLIC_PINTEREST_URL, "pinterest"],
    ["X", process.env.NEXT_PUBLIC_X_URL, "x"],
  ];

  for (const [label, value, icon] of candidates) {
    const href = httpUrl(value);
    if (href) socials.push({ label, href, icon });
  }

  return {
    email: emailLink(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
    socials,
  };
}
