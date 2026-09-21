import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info - Logo added here */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <img 
                src="/logo.png" 
                alt="Solidcare Training Services Logo" 
                className="h-24 w-32 object-contain brightness-0 invert" 
              />
            </div>
            <p className="text-primary-foreground/70 text-sm">
              Professional portable sanitation solutions for events, construction sites, 
              and outdoor venues. Quality you can trust.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "Services", "Products", "Contact"].map((link) => (
                <li key={link}>
                  <button
                    onClick={() => scrollToSection(link.toLowerCase() === "products" ? "products" : link.toLowerCase())}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link === "Products" ? "Our Toilets" : link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>Event Toilet Hire</li>
              <li>Construction Site Units</li>
              <li>VIP Toilet Trailers</li>
              <li>Accessible Toilets</li>
              <li>Regular Servicing</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Phone className="w-4 h-4" />
                <a href="tel:+27000000000" className="hover:text-primary-foreground transition-colors">
                  +27 00 000 0000
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Mail className="w-4 h-4" />
                <a href="mailto:technical@solidcareservices.com" className="hover:text-primary-foreground transition-colors break-all">
                  technical@solidcareservices.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/70">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Serving all areas nationwide</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-10 pt-6 text-center">
          <p className="text-sm text-primary-foreground/60">
            © {currentYear} SolidCare Mobile Toilets. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
