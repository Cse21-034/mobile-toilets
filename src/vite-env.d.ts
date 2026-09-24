/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** EmailJS "Email Service" id — see .env.example */
  readonly VITE_EMAILJS_SERVICE_ID?: string;
  /** EmailJS "Email Template" id */
  readonly VITE_EMAILJS_TEMPLATE_ID?: string;
  /** EmailJS account's public key (safe to expose client-side, unlike an API secret) */
  readonly VITE_EMAILJS_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
