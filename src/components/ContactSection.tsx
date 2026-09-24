import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from "react";
import { useForm, type Resolver, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import emailjs from "@emailjs/browser";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  type LucideIcon,
} from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { emailjsConfig, emailjsConfigured } from "@/lib/emailjs";
import {
  durations,
  mailtoLink,
  site,
  toiletTypes,
  whatsappLink,
  type ContactIntent,
  type ContactRequest,
} from "@/lib/site";
import { cn } from "@/lib/utils";

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
    readyHeading: string;
    sendLabel: string;
    sentTitle: string;
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
    submitLabel: "Review & send request",
    helper: "You'll be able to check your request before it goes out.",
    readyHeading: "Your quote request is ready",
    sendLabel: "Send Request",
    sentTitle: "Quote request sent!",
  },
  general: {
    tabLabel: "General Enquiry",
    eyebrow: "Get In Touch",
    title: "Contact Us",
    description: "Have a question or need more information? Send us a message and we'll get back to you within 24 hours.",
    messageLabel: "How can we help?",
    messageOptional: false,
    messagePlaceholder: "Tell us what you'd like to know or ask us about...",
    submitLabel: "Review & send message",
    helper: "You'll be able to check your message before it goes out.",
    readyHeading: "Your message is ready",
    sendLabel: "Send Message",
    sentTitle: "Message sent!",
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
 * the browser. Any failure (network error, function not deployed, key not configured yet)
 * just returns false so the caller can fall back to EmailJS.
 */
const trySendViaResend = async (subject: string, text: string, replyTo: string) => {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, text, replyTo }),
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Second, client-side sender. Safe to call directly from the browser because EmailJS's
 * "public key" is designed to be exposed (see src/lib/emailjs.ts) — unlike Resend's key.
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

type ReadyPanelProps = {
  mode: ContactIntent;
  values: QuoteFormValues;
  headingRef: RefObject<HTMLHeadingElement>;
  onEdit: () => void;
  sending: boolean;
  sendFailed: boolean;
  onSendMessage: () => void;
  onManualSend: (channel: "whatsapp" | "email") => void;
};

/**
 * Shown after the form validates, before anything has actually gone anywhere. The primary
 * button tries to send for real (Resend, then EmailJS as a fallback — see the two
 * trySendVia* functions above); the WhatsApp/email links only appear if both of those fail,
 * as a manual last resort.
 */
const ReadyPanel = ({ mode, values, headingRef, onEdit, sending, sendFailed, onSendMessage, onManualSend }: ReadyPanelProps) => {
  const copy = modeCopy[mode];
  const message = buildMessage(values, mode);
  const rows: [string, string][] = [
    ["Name", values.name],
    ["Phone", values.phone],
  ];
  if (values.email) rows.push(["Email", values.email]);
  if (mode === "quote") {
    rows.push(
      ["Event location", values.eventLocation],
      ["Start date", formatDate(values.eventDate)],
      ["Rental duration", labelFor(durations, values.duration)],
      ["Toilet type", labelFor(toiletTypes, values.toiletType)],
      ["Quantity", values.quantity],
    );
    if (values.message) rows.push(["Notes", values.message]);
  } else {
    rows.push(["Message", values.message]);
  }

  return (
    <div>
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/15 text-secondary">
        <Check className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
      </span>
      <h3 ref={headingRef} tabIndex={-1} className="mt-4 text-2xl font-extrabold outline-none">
        {copy.readyHeading}
      </h3>
      <p className="mt-2 text-muted-foreground">
        Nothing has been sent yet &mdash; check the details below, then send it to our team.
      </p>

      <dl className="mt-6 divide-y rounded-2xl border bg-muted/50">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <dt className="text-sm font-semibold text-muted-foreground">{label}</dt>
            <dd className="break-words font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6">
        <button
          type="button"
          onClick={onSendMessage}
          disabled={sending}
          className="btn-cta w-full px-8 py-4 text-base disabled:pointer-events-none disabled:opacity-70 sm:w-auto"
        >
          {sending ? "Sending…" : copy.sendLabel}
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {sendFailed && (
        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-foreground">
            That didn&rsquo;t go through. Try again above, or send it manually instead:
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onManualSend("whatsapp")}
              className="btn-cta px-6 py-3 text-sm"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Send on WhatsApp
            </a>
            <a
              href={mailtoLink(emailSubject(values, mode), message)}
              onClick={() => onManualSend("email")}
              className="btn-outline-dark px-6 py-3 text-sm"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Send by email
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onEdit}
        className="focus-ring mt-5 inline-flex items-center gap-2 rounded text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Edit my details
      </button>
    </div>
  );
};

type SentChannel = "resend" | "emailjs" | "whatsapp" | "email";

type SentPanelProps = {
  mode: ContactIntent;
  channel: SentChannel;
  name: string;
  headingRef: RefObject<HTMLHeadingElement>;
  onReset: () => void;
};

/**
 * "resend"/"emailjs" mean the email API confirmed it accepted the message — a real send, so
 * the copy says so plainly. "whatsapp"/"email" mean the visitor was handed off to an external
 * app instead (the automatic senders weren't available); we can't know whether they actually
 * hit send there, so that copy stays honest about what we actually know happened.
 */
const SentPanel = ({ mode, channel, name, headingRef, onReset }: SentPanelProps) => {
  const noun = mode === "quote" ? "quote request" : "message";
  const firstName = name.trim().split(/\s+/)[0];
  const sentDirectly = channel === "resend" || channel === "emailjs";

  return (
    <div>
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/15 text-secondary">
        <Check className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
      </span>
      <h3 ref={headingRef} tabIndex={-1} className="mt-4 text-2xl font-extrabold outline-none">
        Thanks{firstName ? `, ${firstName}` : ""}!
      </h3>
      {sentDirectly ? (
        <p className="mt-2 max-w-md text-muted-foreground">
          Your {noun} has been sent to our team. We&rsquo;ll get back to you within 24 hours.
        </p>
      ) : (
        <>
          <p className="mt-2 max-w-md text-muted-foreground">
            We&rsquo;ve opened {channel === "whatsapp" ? "WhatsApp" : "your email app"} with your {noun} ready to
            send. Once you send it from there, our team will get back to you within 24 hours.
          </p>
          {channel === "email" && (
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Nothing open? Your device may not have an email app set up &mdash; use{" "}
              <span className="font-medium text-foreground">Send on WhatsApp</span> instead, or call us directly.
            </p>
          )}
        </>
      )}

      <button type="button" onClick={onReset} className="btn-outline-dark mt-6 px-6 py-3 text-sm">
        Send another {noun}
      </button>
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
  const [submitted, setSubmitted] = useState<QuoteFormValues | null>(null);
  const [sending, setSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [sent, setSent] = useState<SentChannel | null>(null);
  const readyHeadingRef = useRef<HTMLHeadingElement>(null);
  const sentHeadingRef = useRef<HTMLHeadingElement>(null);

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
    setSubmitted(null);
    setSendFailed(false);
    setSent(null);
  }, [contactRequest, setValue]);

  // Move focus to whichever confirmation heading is showing, so keyboard and screen-reader
  // users land on it instead of staying on the button they just pressed
  useEffect(() => {
    if (sent) sentHeadingRef.current?.focus();
    else if (submitted) readyHeadingRef.current?.focus();
  }, [submitted, sent]);

  const switchMode = (next: ContactIntent) => {
    if (next === mode) return;
    setMode(next);
    setSubmitted(null);
    setSendFailed(false);
    setSent(null);
  };

  const copy = modeCopy[mode];

  const handleValidSubmit = (values: QuoteFormValues) => {
    setSubmitted(values);
    setSendFailed(false);
    setSent(null);
  };

  const handleInvalidSubmit = () => {
    toast({
      variant: "destructive",
      title: "A few details need fixing",
      description: "Check the highlighted fields below and try again.",
    });
  };

  // Tries Resend (our own /api/send-email) first, then EmailJS, before giving up and letting
  // the visitor send it manually via WhatsApp or email.
  const handleSendMessage = async () => {
    if (!submitted) return;
    setSending(true);
    setSendFailed(false);

    const subject = emailSubject(submitted, mode);
    const text = buildMessage(submitted, mode);

    let channel: SentChannel = "resend";
    let ok = await trySendViaResend(subject, text, submitted.email);
    if (!ok) {
      channel = "emailjs";
      ok = await trySendViaEmailJS(submitted, mode, subject, text);
    }

    setSending(false);

    if (ok) {
      setSent(channel);
      toast({ title: copy.sentTitle, description: "Our team will get back to you within 24 hours." });
    } else {
      setSendFailed(true);
      toast({
        variant: "destructive",
        title: "Couldn't send automatically",
        description: "Please try WhatsApp or email below instead.",
      });
    }
  };

  const handleManualSend = (channel: "whatsapp" | "email") => {
    setSent(channel);
    toast({
      title: channel === "whatsapp" ? "Opening WhatsApp…" : "Opening your email app…",
      description: "Finish sending it there and our team will reply within 24 hours.",
    });
  };

  const handleReset = () => {
    form.reset(defaultValues);
    setSubmitted(null);
    setSendFailed(false);
    setSent(null);
  };

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
              {submitted && sent ? (
                <SentPanel mode={mode} channel={sent} name={submitted.name} headingRef={sentHeadingRef} onReset={handleReset} />
              ) : submitted ? (
                <ReadyPanel
                  mode={mode}
                  values={submitted}
                  headingRef={readyHeadingRef}
                  onEdit={() => setSubmitted(null)}
                  sending={sending}
                  sendFailed={sendFailed}
                  onSendMessage={handleSendMessage}
                  onManualSend={handleManualSend}
                />
              ) : (
                <>
                  <div role="tablist" aria-label="What would you like to send us?" className="mb-8 inline-flex rounded-xl bg-muted p-1">
                    {(Object.keys(modeCopy) as ContactIntent[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={mode === key}
                        onClick={() => switchMode(key)}
                        className={cn(
                          "focus-ring min-h-10 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                          mode === key ? "bg-card text-primary shadow-soft" : "text-muted-foreground hover:text-foreground",
                        )}
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
                        <button type="submit" className="btn-cta w-full px-8 py-4 text-base sm:w-auto">
                          {copy.submitLabel}
                          <Send className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <p className="mt-3 text-sm text-muted-foreground">{copy.helper}</p>
                      </div>
                    </form>
                  </Form>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
