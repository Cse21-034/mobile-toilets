/**
 * Single source of truth for business details and form options.
 * Change a phone number, email or opening hours here and it updates everywhere.
 */
export const site = {
  name: "Solidcare Mobile Toilets",
  phones: [
    { display: "+267 73 106 254", tel: "+26773106254" },
    { display: "+267 76 350 238", tel: "+26776350238" },
  ],
  /** International format, digits only, as required by wa.me links */
  whatsapp: "26773106254",
  email: "bookings@solidcaremobiletoilets.com",
  /** Shown on the site. Real mailboxes (Zoho); the contact form routes quotes to bookings@, enquiries to info@. */
  emails: [
    { label: "Bookings", address: "bookings@solidcaremobiletoilets.com" },
    { label: "General enquiries", address: "info@solidcaremobiletoilets.com" },
  ],
  hours: [
    { days: "Mon – Fri", time: "8:00 AM – 5:00 PM" },
    { days: "Sat", time: "8:00 AM – 2:00 PM" },
  ],
  coverage: "Serving all areas nationwide",
} as const;

export const toiletTypes = [
  { value: "vip", label: "VIP" },
  { value: "vvip", label: "VVIP" },
] as const;

export type ToiletType = (typeof toiletTypes)[number]["value"];

export const MAX_RENTAL_DAYS = 30;

/** "1 day", "2 days" … "30 days", each listed separately. */
export const durations = Array.from({ length: MAX_RENTAL_DAYS }, (_, i) => ({
  value: String(i + 1),
  label: i === 0 ? "1 day" : `${i + 1} days`,
}));

/** Whether the contact section should ask for event details ("quote") or just a message ("general"). */
export type ContactIntent = "quote" | "general";

/**
 * Set whenever a visitor is sent to the contact section, so it can switch to the right
 * form and, when a specific unit was picked (e.g. "Request this unit"), pre-select it.
 */
export type ContactRequest = { intent: ContactIntent; toiletType?: ToiletType; nonce: number };

export const whatsappLink = (message?: string) =>
  `https://wa.me/${site.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const mailtoLink = (subject: string, body: string) =>
  `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
