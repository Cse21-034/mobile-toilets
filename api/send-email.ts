import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

/**
 * Server-side mail relay for the contact form. Runs as a Vercel serverless function, so
 * RESEND_API_KEY stays on the server and is never shipped to the browser — unlike a client
 * SDK's public key, Resend's key can send from any address on the account, so it must not be
 * exposed. Set RESEND_API_KEY (required), RESEND_FROM_EMAIL, CONTACT_TO_EMAIL and
 * CONTACT_BCC_EMAIL (all optional) in the Vercel project's Environment Variables — see
 * .env.example.
 *
 * The frontend (ContactSection.tsx) calls this first and falls back to EmailJS if it fails.
 * On success it also best-effort sends a short auto-reply to the visitor's own email, if they
 * gave one — that failing does NOT fail the request, since the business already has the lead.
 */

const MAX_SUBJECT_LENGTH = 200;
const MAX_TEXT_LENGTH = 5000;
const MAX_NAME_LENGTH = 100;

const DEFAULT_TO_EMAIL = "solidcaremobiletoilets661@gmail.com";
const DEFAULT_FROM_EMAIL = "Solidcare Website <onboarding@resend.dev>";
// BCC'd on every enquiry by default so it also lands in the Gmail inbox, whatever
// CONTACT_TO_EMAIL is set to. Set CONTACT_BCC_EMAIL="" (empty) in Vercel to turn this off.
const DEFAULT_BCC_EMAIL = "solidcaremobiletoilets661@gmail.com";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const autoReplyText = (name: string, mode: string) => {
  const noun = mode === "general" ? "message" : "quote request";
  return [
    `Hi ${name},`,
    "",
    `Thanks for reaching out to Solidcare Mobile Toilets! We've received your ${noun} and our team`,
    "will get back to you within 24 hours.",
    "",
    "If it's urgent, you can also reach us directly:",
    "Phone: +267 73 106 254 / +267 76 350 238",
    "WhatsApp: https://wa.me/26773106254",
    "",
    "— Solidcare Mobile Toilets",
  ].join("\n");
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Not configured yet — the client treats this the same as any other failure and falls
    // back to EmailJS or the manual WhatsApp link, so this is safe to leave unset.
    return res.status(503).json({ error: "Email service is not configured" });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const replyTo = typeof body.replyTo === "string" ? body.replyTo.trim() : "";
  const visitorName = typeof body.visitorName === "string" ? body.visitorName.trim().slice(0, MAX_NAME_LENGTH) : "";
  const visitorEmail = typeof body.visitorEmail === "string" ? body.visitorEmail.trim() : "";
  const mode = body.mode === "general" ? "general" : "quote";

  if (!subject || !text) {
    return res.status(400).json({ error: "Missing subject or message" });
  }
  if (subject.length > MAX_SUBJECT_LENGTH || text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({ error: "Message too long" });
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
  const toEmail = process.env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL;
  // process.env.CONTACT_BCC_EMAIL !== undefined lets Vercel's env var explicitly disable this
  // (set to "") without falling back to the default the way `||` would.
  const bccEmail = process.env.CONTACT_BCC_EMAIL !== undefined ? process.env.CONTACT_BCC_EMAIL : DEFAULT_BCC_EMAIL;
  const shouldBcc = bccEmail && bccEmail.toLowerCase() !== toEmail.toLowerCase();
  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      ...(shouldBcc && { bcc: bccEmail }),
      subject,
      text,
      ...(replyTo && { replyTo }),
    });

    if (error) {
      console.error("Resend API error:", error);
      return res.status(502).json({ error: "Failed to send email" });
    }
  } catch (err) {
    console.error("Resend request failed:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }

  let autoReplySent = false;
  if (visitorEmail && EMAIL_RE.test(visitorEmail)) {
    try {
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: visitorEmail,
        subject: "We've received your message — Solidcare Mobile Toilets",
        text: autoReplyText(visitorName || "there", mode),
      });
      autoReplySent = !error;
      if (error) console.error("Resend auto-reply error:", error);
    } catch (err) {
      console.error("Resend auto-reply request failed:", err);
    }
  }

  return res.status(200).json({ ok: true, autoReplySent });
}
