/**
 * EmailJS sends mail straight from the browser, which is only safe because its "public key"
 * is designed to be exposed client-side (unlike Resend's API key, which stays server-only in
 * api/send-email.ts). This is the fallback sender if that serverless function is unreachable.
 *
 * Set these three as VITE_-prefixed environment variables in your host's dashboard (Vercel:
 * Project Settings -> Environment Variables, then redeploy) — see .env.example for where each
 * value comes from. Until they're set, emailjsConfigured is false and the form falls back to
 * manual WhatsApp/email links instead.
 */
export const emailjsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};

export const emailjsConfigured = Boolean(
  emailjsConfig.serviceId && emailjsConfig.templateId && emailjsConfig.publicKey,
);
