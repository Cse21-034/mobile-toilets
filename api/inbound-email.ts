import { Resend } from "resend";

/**
 * Forwards mail received at the domain (bookings@, info@ …) to the business Gmail inbox.
 *
 * The domain's MX record already points at Resend's inbound servers, so Resend receives the
 * mail; this endpoint is the webhook Resend calls (`email.received`) for each message. Set up:
 *   1. Resend dashboard -> Webhooks -> Add endpoint:
 *        https://<your-site>/api/inbound-email   with the event "email.received"
 *   2. Copy that webhook's signing secret into Vercel as RESEND_WEBHOOK_SECRET, then redeploy.
 *
 * Unlike the SDK's own `receiving.forward()` helper, this sets Reply-To to the original sender,
 * so hitting Reply in Gmail answers the customer rather than bookings@ itself.
 *
 * Env: RESEND_API_KEY and RESEND_WEBHOOK_SECRET (required); FORWARD_TO_EMAIL (defaults to the
 * business Gmail) and RESEND_FROM_EMAIL (the verified sender, shared with api/send-email.ts).
 */

const DEFAULT_FORWARD_TO = "solidcaremobiletoilets661@gmail.com";
const DEFAULT_FROM_EMAIL = "Solidcare Website <onboarding@resend.dev>";

/** "Name <a@b.com>" or "a@b.com" -> "a@b.com" (lowercased). */
const addressOf = (value: string) => (value.match(/<([^>]+)>/)?.[1] ?? value).trim().toLowerCase();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!apiKey || !webhookSecret) {
    // A non-2xx makes Resend retry later, so nothing is lost while this is being configured.
    console.error("inbound-email: RESEND_API_KEY or RESEND_WEBHOOK_SECRET is not set");
    return json({ error: "Not configured" }, 500);
  }

  const resend = new Resend(apiKey);
  const payload = await request.text();

  // Reject anything not genuinely signed by Resend for this webhook.
  let event;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: request.headers.get("svix-id") ?? request.headers.get("webhook-id") ?? "",
        timestamp: request.headers.get("svix-timestamp") ?? request.headers.get("webhook-timestamp") ?? "",
        signature: request.headers.get("svix-signature") ?? request.headers.get("webhook-signature") ?? "",
      },
      webhookSecret,
    });
  } catch {
    return json({ error: "Invalid signature" }, 401);
  }

  if (event.type !== "email.received") return json({ ignored: event.type });

  const fromEmail = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
  const forwardTo = process.env.FORWARD_TO_EMAIL || DEFAULT_FORWARD_TO;
  const { email_id: emailId, from: sender, received_for: receivedFor } = event.data;

  // Our own contact-form notifications are sent from this same address and already reach Gmail
  // by BCC (see api/send-email.ts). Skipping them avoids duplicates and any chance of a loop.
  if (addressOf(sender) === addressOf(fromEmail)) return json({ skipped: "own notification" });

  const { data: email, error: getError } = await resend.emails.receiving.get(emailId);
  if (getError || !email) {
    console.error("inbound-email: could not fetch received email", emailId, getError);
    return json({ error: "Could not fetch email" }, 502);
  }

  const { data: attachmentList } = await resend.emails.receiving.attachments.list({ emailId });
  const attachments = (attachmentList?.data ?? []).map((attachment) => ({
    filename: attachment.filename,
    path: attachment.download_url,
    contentType: attachment.content_type,
    ...(attachment.content_disposition === "inline" && attachment.content_id && { contentId: attachment.content_id }),
  }));

  // Tag the subject with which inbox it arrived at, e.g. "[bookings] Quote for Saturday".
  const inbox = (receivedFor?.[0] ?? email.to?.[0] ?? "").split("@")[0];
  const subject = `${inbox ? `[${inbox}] ` : ""}${email.subject || "(no subject)"}`;
  const replyTo = email.reply_to?.length ? email.reply_to : [sender];

  const { error: sendError } = await resend.emails.send(
    {
      from: fromEmail,
      to: forwardTo,
      replyTo,
      subject,
      ...(email.html ? { html: email.html } : {}),
      text: email.text || (email.html ? undefined : "(This email had no text content.)"),
      ...(attachments.length > 0 && { attachments }),
    } as Parameters<typeof resend.emails.send>[0],
    // Resend retries webhooks on failure; the key makes a retry a no-op instead of a duplicate.
    { idempotencyKey: `inbound-forward/${emailId}` },
  );

  if (sendError) {
    console.error("inbound-email: forward failed", emailId, sendError);
    return json({ error: "Forward failed" }, 502);
  }

  return json({ forwarded: emailId });
}
