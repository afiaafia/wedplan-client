import test from "node:test";
import assert from "node:assert/strict";
import { getFooterContact } from "../src/lib/footer-links.ts";

test("footer contact links accept only valid HTTP(S) and email values", () => {
  const original = {
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    NEXT_PUBLIC_INSTAGRAM_URL: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    NEXT_PUBLIC_FACEBOOK_URL: process.env.NEXT_PUBLIC_FACEBOOK_URL,
    NEXT_PUBLIC_PINTEREST_URL: process.env.NEXT_PUBLIC_PINTEREST_URL,
    NEXT_PUBLIC_X_URL: process.env.NEXT_PUBLIC_X_URL,
  };

  process.env.NEXT_PUBLIC_CONTACT_EMAIL = "support@wedplan.test";
  process.env.NEXT_PUBLIC_INSTAGRAM_URL = "https://instagram.com/wedplan";
  process.env.NEXT_PUBLIC_FACEBOOK_URL = "javascript:alert(1)";
  process.env.NEXT_PUBLIC_PINTEREST_URL = "not-a-url";
  process.env.NEXT_PUBLIC_X_URL = "https://x.com/wedplan";

  try {
    const contact = getFooterContact();
    assert.equal(contact.email, "mailto:support@wedplan.test");
    assert.deepEqual(
      contact.socials.map(({ label, href }) => ({ label, href })),
      [
        {
          label: "Instagram",
          href: "https://instagram.com/wedplan",
        },
        {
          label: "X",
          href: "https://x.com/wedplan",
        },
      ]
    );
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
