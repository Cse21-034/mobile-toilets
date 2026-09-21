import { ArrowUp, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Logo from "@/components/Logo";
import { site, whatsappLink } from "@/lib/site";

const quickLinks = [
  { href: "#home", label: "Home" },
  { href: "#services", label: "Services" },
  { href: "#products", label: "Our Toilets" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
];

const serviceList = [
  "Event Toilet Hire",
  "Construction Site Units",
  "VIP Toilet Trailers",
  "Accessible Toilets",
  "Regular Servicing",
];

const linkClass =
  "focus-ring rounded text-sm text-white/70 transition-colors hover:text-white";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="on-dark bg-[hsl(190_45%_7%)] pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-white lg:pb-0">
      <div className="container py-14 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:gap-12">
          <div>
            <a href="#home" className="focus-ring inline-block rounded-lg" aria-label="Solidcare Rental Services, back to top">
              <Logo variant="light" />
            </a>
            <p className="mt-4 text-sm tracking-[0.12em] text-white/85">&ldquo;Rentals re-defined&rdquo;</p>
            <p className="mt-3 max-w-xs text-sm text-white/70">
              Professional portable sanitation solutions for events, construction sites, and outdoor venues. Quality
              you can trust.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Quick Links</h2>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Our Services</h2>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              {serviceList.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Contact Us</h2>
            <ul className="mt-5 space-y-3.5">
              {site.phones.map((phone) => (
                <li key={phone.tel} className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-cta" aria-hidden="true" />
                  <a href={`tel:${phone.tel}`} className={linkClass}>
                    {phone.display}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 shrink-0 text-cta" aria-hidden="true" />
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Chat on WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-cta" aria-hidden="true" />
                <a href={`mailto:${site.email}`} className={`${linkClass} break-all`}>
                  {site.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cta" aria-hidden="true" />
                <span>{site.coverage}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 sm:flex-row">
          <p className="text-sm text-white/60">
            © {currentYear} {site.name}. All rights reserved.
          </p>
          <a href="#home" className="focus-ring flex items-center gap-2 rounded text-sm text-white/70 transition-colors hover:text-white">
            Back to top
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
