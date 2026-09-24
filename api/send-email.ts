import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

/**
 * Server-side mail relay for the contact form. Runs as a Vercel serverless function, so
 * RESEND_API_KEY stays on the server and is never shipped to the browser — unlike a client
 * SDK's public key, Resend's key can send from any address on the account, so it must not be
 * exposed. Set RESEND_API_KEY (required), RESEND_FROM_EMAIL and CONTACT_TO_EMAIL (both
 * optional) in the Vercel project's Environment Variables — see .env.example.
 *
 * The frontend (ContactSection.tsx) calls this first and falls back to EmailJS if it fails.
 */

const MAX_SUBJECT_LENGTH = 200;
const MAX_TEXT_LENGTH = 5000;

const DEFAULT_TO_EMAIL = "solidcaremobiletoilets661@gmail.com";
const DEFAULT_FROM_EMAIL = "Solidcare Website <onboarding@resend.dev>";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Not configured yet — the client treats this the same as any other failure and falls
    // back to EmailJS or the manual WhatsApp/email links, so this is safe to leave unset.
    return res.status(503).json({ error: "Email service is not configured" });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const replyTo = typeof body.replyTo === "string" ? body.replyTo.trim() : "";

  if (!subject || !text) {
    return res.status(400).json({ error: "Missing subject or message" });
  }
  if (subject.length > MAX_SUBJECT_LENGTH || text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({ error: "Message too long" });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
      to: process.env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL,
      subject,
      text,
      ...(replyTo && { replyTo }),
    });

    if (error) {
      console.error("Resend API error:", error);
      return res.status(502).json({ error: "Failed to send email" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Resend request failed:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
