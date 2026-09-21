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
  email: "solidcaremobiletoilets661@gmail.com",
  hours: [
    { days: "Mon – Fri", time: "7:00 AM – 6:00 PM" },
    { days: "Sat", time: "8:00 AM – 2:00 PM" },
  ],
  coverage: "Serving all areas nationwide",
} as const;

export const toiletTypes = [
  { value: "standard", label: "Standard Portable" },
  { value: "vip", label: "VIP Luxury Trailer" },
  { value: "accessible", label: "Accessible Unit" },
  { value: "mixed", label: "Mixed (Multiple Types)" },
] as const;

export type ToiletType = (typeof toiletTypes)[number]["value"];

export const durations = [
  { value: "1-day", label: "1 Day" },
  { value: "2-3-days", label: "2-3 Days" },
  { value: "1-week", label: "1 Week" },
  { value: "2-weeks", label: "2 Weeks" },
  { value: "1-month", label: "1 Month" },
  { value: "3-months", label: "3 Months" },
  { value: "6-months", label: "6+ Months" },
] as const;

/** Set when a visitor clicks "Request this unit" so the quote form can pre-select it. */
export type QuoteRequest = { type: ToiletType; nonce: number };

export const whatsappLink = (message?: string) =>
  `https://wa.me/${site.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const mailtoLink = (subject: string, body: string) =>
  `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
