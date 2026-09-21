import { useEffect, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock,
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
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { durations, mailtoLink, site, toiletTypes, whatsappLink, type QuoteRequest } from "@/lib/site";

const todayISO = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
};

const quoteSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a phone number we can reach you on")
    .regex(/^\+?[\d\s()-]+$/, "Use digits, spaces and + only"),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Enter a valid email address"),
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

const labelFor = (options: readonly { value: string; label: string }[], value: string) =>
  options.find((option) => option.value === value)?.label ?? value;

const formatDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const buildMessage = (values: QuoteFormValues) =>
  [
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
  values: QuoteFormValues;
  headingRef: RefObject<HTMLHeadingElement>;
  onEdit: () => void;
};

/** Shown after the form validates. Nothing is sent from the browser; the visitor picks WhatsApp or email. */
const ReadyPanel = ({ values, headingRef, onEdit }: ReadyPanelProps) => {
  const message = buildMessage(values);
  const rows: [string, string][] = [
    ["Name", values.name],
    ["Phone", values.phone],
  ];
  if (values.email) rows.push(["Email", values.email]);
  rows.push(
    ["Event location", values.eventLocation],
    ["Start date", formatDate(values.eventDate)],
    ["Rental duration", labelFor(durations, values.duration)],
    ["Toilet type", labelFor(toiletTypes, values.toiletType)],
    ["Quantity", values.quantity],
  );
  if (values.message) rows.push(["Notes", values.message]);

  return (
    <div>
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/15 text-secondary">
        <Check className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
      </span>
      <h3 ref={headingRef} tabIndex={-1} className="mt-4 text-2xl font-extrabold outline-none">
        Your quote request is ready
      </h3>
      <p className="mt-2 text-muted-foreground">
        Nothing has been sent yet. Choose how you&rsquo;d like to send it to our team &mdash; we reply within 24
        hours.
      </p>

      <dl className="mt-6 divide-y rounded-2xl border bg-muted/50">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <dt className="text-sm font-semibold text-muted-foreground">{label}</dt>
            <dd className="break-words font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cta px-8 py-4 text-base"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Send on WhatsApp
        </a>
        <a
          href={mailtoLink(
            `Quote request: ${labelFor(toiletTypes, values.toiletType)} in ${values.eventLocation}`,
            message,
          )}
          className="btn-outline-dark px-8 py-4 text-base"
        >
          <Mail className="h-5 w-5" aria-hidden="true" />
          Send by email
        </a>
      </div>

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

type ContactSectionProps = {
  /** Set when a visitor picks a unit in "Our Toilets"; pre-selects it in the form */
  quoteRequest: QuoteRequest | null;
};

const ContactSection = ({ quoteRequest }: ContactSectionProps) => {
  const [submitted, setSubmitted] = useState<QuoteFormValues | null>(null);
  const readyHeadingRef = useRef<HTMLHeadingElement>(null);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues,
    mode: "onTouched",
  });
  const { setValue } = form;

  useEffect(() => {
    if (!quoteRequest) return;
    setValue("toiletType", quoteRequest.type, { shouldValidate: true, shouldDirty: true });
    setSubmitted(null);
  }, [quoteRequest, setValue]);

  // Move focus to the confirmation heading so keyboard and screen-reader users land on it
  useEffect(() => {
    if (submitted) readyHeadingRef.current?.focus();
  }, [submitted]);

  return (
    <section id="contact" className="section-padding bg-muted">
      <div className="container">
        <SectionHeader
          eyebrow="Get In Touch"
          title="Request a Quotation"
          description="Fill out the form below with your event details and we'll get back to you with a customised quote within 24 hours."
        />

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
                  <a href={`mailto:${site.email}`} className={`${contactLinkClass} inline-flex break-words text-sm sm:text-base`}>
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
              {submitted ? (
                <ReadyPanel values={submitted} headingRef={readyHeadingRef} onEdit={() => setSubmitted(null)} />
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(setSubmitted)} noValidate className="space-y-8">
                    <fieldset className="min-w-0">
                      <legend className="mb-5 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.14em] text-primary">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs text-primary-foreground">
                          1
                        </span>
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
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel className="font-semibold">
                                Additional details
                                <span className="font-normal text-muted-foreground"> (optional)</span>
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={4}
                                  placeholder="Tell us more about your event or any special requirements..."
                                  className={`resize-none ${invalidBorder}`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </fieldset>

                    <div>
                      <button type="submit" className="btn-cta w-full px-8 py-4 text-base sm:w-auto">
                        Review &amp; send request
                        <Send className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <p className="mt-3 text-sm text-muted-foreground">
                        You&rsquo;ll be able to check your request, then send it by WhatsApp or email.
                      </p>
                    </div>
                  </form>
                </Form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
