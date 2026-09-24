import { useCallback, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { useForm, type Resolver, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import emailjs from "@emailjs/browser";
import { Check, ChevronDown, Clock, Loader2, Mail, MapPin, MessageCircle, Phone, Send, type LucideIcon } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { emailjsConfig, emailjsConfigured } from "@/lib/emailjs";
import { durations, site, toiletTypes, whatsappLink, type ContactIntent, type ContactRequest } from "@/lib/site";

const todayISO = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
};

// Shared by both schemas so every field keeps the exact same TypeScript shape regardless
// of which one is active; only the runtime rules (required vs. free-form) differ below.
const requiredName = z.string().trim().min(2, "Please enter your full name");
const requiredPhone = z
  .string()
  .trim()
  .min(7, "Please enter a phone number we can reach you on")
  .regex(/^\+?[\d\s()-]+$/, "Use digits, spaces and + only");
const optionalEmail = z
  .string()
  .trim()
  .refine((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Enter a valid email address");

/** Full quote request: name/phone/email plus every event detail we need to price it. */
const quoteSchema = z.object({
  name: requiredName,
  phone: requiredPhone,
  email: optionalEmail,
  eventLocation: z.string().trim().min(2, "Tell us where the units should be delivered"),
  eventDate: z
    .string()
    .min(1, "Choose a start date")
    .refine((value) => value >= todayISO(), "The start date can't be in the past"),
  duration: z.string().min(1, "Choose a rental duration"),
  toiletType: z.string().min(1, "Choose a toilet type"),
  quantity: z
    .string()
    .trim()
    .min(1, "Enter how many units you need")
    .regex(/^\d+$/, "Enter a whole number")
    .refine((value) => Number(value) >= 1, "At least 1 unit")
    .refine((value) => Number(value) <= 500, "For more than 500 units, please call us"),
  message: z.string().trim().max(1000, "Please keep this under 1000 characters"),
});

/** General enquiry: just enough to reply, plus a required message since there's no event to go on. */
const generalSchema = z.object({
  name: requiredName,
  phone: requiredPhone,
  email: optionalEmail,
  eventLocation: z.string(),
  eventDate: z.string(),
  duration: z.string(),
  toiletType: z.string(),
  quantity: z.string(),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more about what you need")
    .max(1000, "Please keep this under 1000 characters"),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

const defaultValues: QuoteFormValues = {
  name: "",
  phone: "",
  email: "",
  eventLocation: "",
  eventDate: "",
  duration: "",
  toiletType: "",
  quantity: "",
  message: "",
};

// Copy that changes depending on whether the visitor wants a quote or is just getting in touch.
const modeCopy: Record<
  ContactIntent,
  {
    tabLabel: string;
    eyebrow: string;
    title: string;
    description: string;
    messageLabel: string;
    messageOptional: boolean;
    messagePlaceholder: string;
    submitLabel: string;
    helper: string;
    sentTitle: string;
    noun: string;
  }
> = {
  quote: {
    tabLabel: "Request a Quote",
    eyebrow: "Get In Touch",
    title: "Request a Quotation",
    description:
      "Fill out the form below with your event details and we'll get back to you with a customised quote within 24 hours.",
    messageLabel: "Additional details",
    messageOptional: true,
    messagePlaceholder: "Tell us more about your event or any special requirements...",
    submitLabel: "Send Request",
    helper: "Sent straight to our team — no extra steps.",
    sentTitle: "Quote request sent!",
    noun: "quote request",
  },
  general: {
    tabLabel: "General Enquiry",
    eyebrow: "Get In Touch",
    title: "Contact Us",
    description: "Have a question or need more information? Send us a message and we'll get back to you within 24 hours.",
    messageLabel: "How can we help?",
    messageOptional: false,
    messagePlaceholder: "Tell us what you'd like to know or ask us about...",
    submitLabel: "Send Message",
    helper: "Sent straight to our team — no extra steps.",
    sentTitle: "Message sent!",
    noun: "message",
  },
};

const labelFor = (options: readonly { value: string; label: string }[], value: string) =>
  options.find((option) => option.value === value)?.label ?? value;

const formatDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const buildMessage = (values: QuoteFormValues, mode: ContactIntent) => {
  if (mode === "general") {
    return [
      `Hi ${site.name}, I have a question:`,
      "",
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      values.email ? `Email: ${values.email}` : null,
      "",
      values.message,
    ]
      .filter((line): line is string => line !== null)
      .join("\n");
  }

  return [
    `Hi ${site.name}, I'd like a quote:`,
    "",
    `Name: ${values.name}`,
    `Phone: ${values.phone}`,
    values.email ? `Email: ${values.email}` : null,
    `Event location: ${values.eventLocation}`,
    `Start date: ${formatDate(values.eventDate)}`,
    `Rental duration: ${labelFor(durations, values.duration)}`,
    `Toilet type: ${labelFor(toiletTypes, values.toiletType)}`,
    `Quantity: ${values.quantity}`,
    values.message ? `Notes: ${values.message}` : null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
};

const emailSubject = (values: QuoteFormValues, mode: ContactIntent) =>
  mode === "general"
    ? `Enquiry from ${values.name}`
    : `Quote request: ${labelFor(toiletTypes, values.toiletType)} in ${values.eventLocation}`;

/**
 * First of two automatic senders. Calls our own serverless function (api/send-email.ts),
 * which holds the Resend API key server-side — it's never safe to call Resend directly from
 * the browser. On success, that function also best-effort emails the visitor a short "we got
 * it" auto-reply if they gave an email address. Any failure here just returns false so the
 * caller can fall back to EmailJS.
 */
const trySendViaResend = async (subject: string, text: string, values: QuoteFormValues, mode: ContactIntent) => {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        text,
        replyTo: values.email,
        visitorName: values.name,
        visitorEmail: values.email,
        mode,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Second, client-side sender. Safe to call directly from the browser because EmailJS's
 * "public key" is designed to be exposed (see src/lib/emailjs.ts) — unlike Resend's key.
 * Note: this path does not send the visitor auto-reply — that's only wired up for Resend.
 */
const trySendViaEmailJS = async (values: QuoteFormValues, mode: ContactIntent, subject: string, text: string) => {
  if (!emailjsConfigured) return false;
  try {
    await emailjs.send(
      emailjsConfig.serviceId,
      emailjsConfig.templateId,
      {
        subject,
        message: text,
        from_name: values.name,
        reply_to: values.email || "(not provided)",
        mode: mode === "quote" ? "Quote Request" : "General Enquiry",
      },
      { publicKey: emailjsConfig.publicKey },
    );
    return true;
  } catch {
    return false;
  }
};

// On narrow screens a long address wraps at the "@" instead of in the middle of a word
const [emailUser, emailDomain] = site.email.split("@");

const invalidBorder = "aria-[invalid=true]:border-destructive";

const selectClass = `h-11 w-full appearance-none rounded-md border border-input bg-background px-3 pr-10 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm ${invalidBorder}`;

// Display (flex / inline-flex) is added where the class is used, so the two never conflict
const contactLinkClass = "focus-ring min-h-10 items-center rounded transition-colors hover:text-cta";

type TextFieldProps = {
  form: UseFormReturn<QuoteFormValues>;
  name: "name" | "phone" | "email" | "eventLocation" | "eventDate" | "quantity";
  label: string;
  optional?: boolean;
  description?: string;
  className?: string;
} & Pick<ComponentProps<typeof Input>, "type" | "placeholder" | "autoComplete" | "inputMode" | "min">;

const TextField = ({ form, name, label, optional, description, className, ...inputProps }: TextFieldProps) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel className="font-semibold">
          {label}
          {optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
        </FormLabel>
        <FormControl>
          <Input {...inputProps} {...field} className={`h-11 ${invalidBorder}`} />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

type SelectFieldProps = {
  form: UseFormReturn<QuoteFormValues>;
  name: "duration" | "toiletType";
  label: string;
  placeholder: string;
  options: readonly { value: string; label: string }[];
};

const SelectField = ({ form, name, label, placeholder, options }: SelectFieldProps) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="font-semibold">{label}</FormLabel>
        <div className="relative">
          <FormControl>
            <select {...field} className={selectClass}>
              <option value="">{placeholder}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormControl>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <FormMessage />
      </FormItem>
    )}
  />
);

const ContactRow = ({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) => (
  <li className="flex items-start gap-4">
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-cta ring-1 ring-white/15">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-white/70">{label}</p>
      <div className="mt-0.5 font-semibold text-white">{children}</div>
    </div>
  </li>
);

/** What happened the last time the form was submitted, so the UI below can react to it. */
type SendOutcome =
  | { status: "success"; mode: ContactIntent; name: string; hadEmail: boolean }
  | { status: "error"; mode: ContactIntent; values: QuoteFormValues };

type SendSuccessDialogProps = {
  outcome: Extract<SendOutcome, { status: "success" }> | null;
  onClose: () => void;
};

/** The "welcome" popup shown the moment a send is confirmed — always centred on the page. */
const SendSuccessDialog = ({ outcome, onClose }: SendSuccessDialogProps) => {
  const firstName = outcome?.name.trim().split(/\s+/)[0] ?? "";
  const noun = outcome ? modeCopy[outcome.mode].noun : "";

  return (
    <Dialog open={outcome !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="text-center sm:max-w-md">
        {outcome && (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary/15 text-secondary">
              <Check className="h-7 w-7" strokeWidth={3} aria-hidden="true" />
            </div>
            <DialogTitle className="mt-4 text-center text-2xl font-extrabold">{modeCopy[outcome.mode].sentTitle}</DialogTitle>
            <DialogDescription className="mt-1 text-center text-base text-muted-foreground">
              Thanks{firstName ? `, ${firstName}` : ""}! Your {noun} has been sent to our team &mdash; we&rsquo;ll get
              back to you within 24 hours.
              {outcome.hadEmail && " We've also sent a confirmation to your email."}
            </DialogDescription>
            <button type="button" onClick={onClose} className="btn-cta mt-6 w-full justify-center">
              Done
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

type SendFailureNoticeProps = {
  outcome: Extract<SendOutcome, { status: "error" }>;
  onRetry: () => void;
  onWhatsApp: () => void;
};

/**
 * Shown inline (not a popup) when both automatic senders fail. WhatsApp is offered as THE way
 * forward rather than another email attempt — email is what just failed.
 */
const SendFailureNotice = ({ outcome, onRetry, onWhatsApp }: SendFailureNoticeProps) => {
  const { noun } = modeCopy[outcome.mode];
  const message = buildMessage(outcome.values, outcome.mode);

  return (
    <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
      <p className="font-semibold text-foreground">
        We couldn&rsquo;t send your {noun} &mdash; there&rsquo;s a technical problem with email right now.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">No problem &mdash; reach us on WhatsApp instead and we&rsquo;ll help right away.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onWhatsApp}
          className="btn-cta px-6 py-3 text-sm"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Continue on WhatsApp
        </a>
        <button type="button" onClick={onRetry} className="btn-outline-dark px-6 py-3 text-sm">
          Try again
        </button>
      </div>
    </div>
  );
};

type ContactSectionProps = {
  /** Set whenever a visitor is sent here, e.g. by the "Contact" link or "Request this unit" */
  contactRequest: ContactRequest | null;
};

const ContactSection = ({ contactRequest }: ContactSectionProps) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<ContactIntent>("quote");
  const [sending, setSending] = useState(false);
  const [outcome, setOutcome] = useState<SendOutcome | null>(null);

  // The active schema is read from this ref at validation time, so switching `mode` takes
  // effect immediately without needing to recreate the form (and losing what was typed).
  const schemaRef = useRef<z.ZodType<QuoteFormValues>>(quoteSchema);
  schemaRef.current = mode === "quote" ? quoteSchema : generalSchema;
  const resolver: Resolver<QuoteFormValues> = useCallback(
    (values, context, options) => zodResolver(schemaRef.current)(values, context, options),
    [],
  );

  const form = useForm<QuoteFormValues>({
    resolver,
    defaultValues,
    mode: "onTouched",
  });
  const { setValue } = form;

  useEffect(() => {
    if (!contactRequest) return;
    setMode(contactRequest.intent);
    if (contactRequest.toiletType) {
      setValue("toiletType", contactRequest.toiletType, { shouldValidate: true, shouldDirty: true });
    }
    setOutcome(null);
  }, [contactRequest, setValue]);

  const switchMode = (next: ContactIntent) => {
    if (next === mode) return;
    setMode(next);
    setOutcome(null);
  };

  const copy = modeCopy[mode];

  // No review step: a valid submit sends immediately, trying Resend then EmailJS.
  const handleValidSubmit = async (values: QuoteFormValues) => {
    setSending(true);

    const subject = emailSubject(values, mode);
    const text = buildMessage(values, mode);

    let ok = await trySendViaResend(subject, text, values, mode);
    if (!ok) ok = await trySendViaEmailJS(values, mode, subject, text);

    setSending(false);

    if (ok) {
      setOutcome({ status: "success", mode, name: values.name, hadEmail: Boolean(values.email) });
      form.reset(defaultValues);
    } else {
      setOutcome({ status: "error", mode, values });
    }
  };

  const handleInvalidSubmit = () => {
    toast({
      variant: "destructive",
      title: "A few details need fixing",
      description: "Check the highlighted fields below and try again.",
    });
  };

  const handleWhatsAppFallback = () => {
    toast({ title: "Opening WhatsApp…", description: "Send it from there and our team will reply within 24 hours." });
  };

  const showForm = outcome === null || outcome.status === "error";

  return (
    <section id="contact" className="section-padding bg-muted">
      <div className="container">
        <SectionHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sticky on desktop so it stays beside the form instead of stretching to the form's height */}
          <Reveal className="lg:sticky lg:top-28 lg:col-span-1 lg:self-start">
            <div className="hero-gradient on-dark rounded-3xl p-6 text-white shadow-elevated sm:p-8">
              <h3 className="text-2xl font-extrabold">Talk to us directly</h3>
              <p className="mt-3 text-white/80">
                Prefer to speak to someone? Reach out and we&rsquo;ll help you choose the right units.
              </p>

              <ul className="mt-8 space-y-6">
                <ContactRow icon={Phone} label="Call us">
                  {site.phones.map((phone) => (
                    <a key={phone.tel} href={`tel:${phone.tel}`} className={`${contactLinkClass} flex`}>
                      {phone.display}
                    </a>
                  ))}
                </ContactRow>
                <ContactRow icon={MessageCircle} label="WhatsApp">
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${contactLinkClass} inline-flex`}
                  >
                    Chat with us
                  </a>
                </ContactRow>
                <ContactRow icon={Mail} label="Email">
                  <a
                    href={`mailto:${site.email}`}
                    className={`${contactLinkClass} inline-flex break-words text-sm sm:text-base`}
                  >
                    <span>
                      {emailUser}
                      <wbr />@{emailDomain}
                    </span>
                  </a>
                </ContactRow>
                <ContactRow icon={Clock} label="Office hours">
                  {site.hours.map((entry) => (
                    <p key={entry.days}>
                      {entry.days}: <span className="font-medium text-white/85">{entry.time}</span>
                    </p>
                  ))}
                </ContactRow>
                <ContactRow icon={MapPin} label="Coverage">
                  {site.coverage}
                </ContactRow>
              </ul>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-2" delay={100}>
            <div className="rounded-3xl border bg-card p-6 shadow-card sm:p-8">
              {showForm && (
                <>
                  <div role="tablist" aria-label="What would you like to send us?" className="mb-8 inline-flex rounded-xl bg-muted p-1">
                    {(Object.keys(modeCopy) as ContactIntent[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={mode === key}
                        onClick={() => switchMode(key)}
                        className={`focus-ring min-h-10 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                          mode === key ? "bg-card text-primary shadow-soft" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {modeCopy[key].tabLabel}
                      </button>
                    ))}
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleValidSubmit, handleInvalidSubmit)} noValidate className="space-y-8">
                      <fieldset className="min-w-0">
                        <legend className="mb-5 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.14em] text-primary">
                          {mode === "quote" && (
                            <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs text-primary-foreground">
                              1
                            </span>
                          )}
                          Your details
                        </legend>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <TextField form={form} name="name" label="Full name" autoComplete="name" placeholder="John Doe" />
                          <TextField
                            form={form}
                            name="phone"
                            label="Phone number"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="+267 71 234 567"
                          />
                          <TextField
                            form={form}
                            name="email"
                            label="Email address"
                            optional
                            type="email"
                            autoComplete="email"
                            placeholder="john@example.com"
                            className="sm:col-span-2"
                          />
                        </div>
                      </fieldset>

                      {mode === "quote" && (
                        <fieldset className="min-w-0">
                          <legend className="mb-5 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.14em] text-primary">
                            <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs text-primary-foreground">
                              2
                            </span>
                            Event details
                          </legend>
                          <div className="grid gap-5 sm:grid-cols-2">
                            <TextField
                              form={form}
                              name="eventLocation"
                              label="Event location"
                              placeholder="City or address"
                              className="sm:col-span-2"
                            />
                            <TextField
                              form={form}
                              name="eventDate"
                              label="Event / start date"
                              type="date"
                              min={todayISO()}
                            />
                            <SelectField
                              form={form}
                              name="duration"
                              label="Rental duration"
                              placeholder="Select duration"
                              options={durations}
                            />
                            <SelectField
                              form={form}
                              name="toiletType"
                              label="Toilet type"
                              placeholder="Select type"
                              options={toiletTypes}
                            />
                            <TextField
                              form={form}
                              name="quantity"
                              label="Quantity needed"
                              inputMode="numeric"
                              placeholder="e.g. 5"
                            />
                          </div>
                        </fieldset>
                      )}

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">
                              {copy.messageLabel}
                              {copy.messageOptional && <span className="font-normal text-muted-foreground"> (optional)</span>}
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                rows={4}
                                placeholder={copy.messagePlaceholder}
                                className={`resize-none ${invalidBorder}`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <button
                          type="submit"
                          disabled={sending}
                          className="btn-cta w-full px-8 py-4 text-base disabled:pointer-events-none disabled:opacity-70 sm:w-auto"
                        >
                          {sending ? "Sending…" : copy.submitLabel}
                          {sending ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <Send className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                        <p className="mt-3 text-sm text-muted-foreground">{copy.helper}</p>
                      </div>
                    </form>
                  </Form>

                  {outcome?.status === "error" && (
                    <SendFailureNotice outcome={outcome} onRetry={() => setOutcome(null)} onWhatsApp={handleWhatsAppFallback} />
                  )}
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      <SendSuccessDialog outcome={outcome?.status === "success" ? outcome : null} onClose={() => setOutcome(null)} />
    </section>
  );
};

export default ContactSection;
