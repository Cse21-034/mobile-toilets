import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import Logo from "@/components/Logo";
import { useActiveSection } from "@/hooks/use-active-section";
import { site, type ContactIntent } from "@/lib/site";
import { cn } from "@/lib/utils";

const links = [
  { id: "services", label: "Services" },
  { id: "products", label: "Our Toilets" },
  { id: "how-it-works", label: "How It Works" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact" },
];

const sectionIds = ["home", ...links.map((link) => link.id)];

type HeaderProps = {
  /** "Contact" opens a general enquiry; "Get a Quote" opens the quote form */
  onNavigateContact: (intent: ContactIntent) => void;
};

const Header = ({ onNavigateContact }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(sectionIds);
  const phone = site.phones[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes the mobile menu; it also closes if the window grows to the desktop layout
  useEffect(() => {
    if (!menuOpen) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const onResize = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onResize);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onResize);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const linkIntent = (id: string): ContactIntent | undefined => (id === "contact" ? "general" : undefined);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md transition-[background-color,box-shadow,border-color] duration-300",
        "bg-background/95",
        scrolled || menuOpen ? "border-border shadow-soft" : "border-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <a href="#home" className="focus-ring rounded-lg" aria-label="Solidcare Mobile Toilets, back to top">
          <Logo />
        </a>

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const isActive = active === link.id;
            const intent = linkIntent(link.id);
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={intent ? () => onNavigateContact(intent) : undefined}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "focus-ring relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-foreground/75",
                )}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-3 bottom-0 h-0.5 origin-left rounded-full bg-cta transition-transform duration-300",
                    isActive ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </a>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${phone.tel}`}
            className="focus-ring flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-primary transition-colors hover:text-primary/75"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {phone.display}
          </a>
          <a href="#contact" onClick={() => onNavigateContact("quote")} className="btn-cta !min-h-10 px-5 py-2 text-sm">
            Get a Quote
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="focus-ring -mr-2 grid h-11 w-11 place-items-center rounded-lg text-foreground lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile navigation */}
      <nav id="mobile-menu" aria-label="Mobile" hidden={!menuOpen} className="border-t border-border bg-background lg:hidden">
        <div className="container flex flex-col py-3">
          {links.map((link) => {
            const intent = linkIntent(link.id);
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => {
                  if (intent) onNavigateContact(intent);
                  closeMenu();
                }}
                aria-current={active === link.id ? "location" : undefined}
                className={cn(
                  "focus-ring flex min-h-12 items-center rounded-lg px-3 text-base font-semibold transition-colors hover:bg-accent",
                  active === link.id ? "bg-accent text-primary" : "text-foreground",
                )}
              >
                {link.label}
              </a>
            );
          })}
          <a
            href="#contact"
            onClick={() => {
              onNavigateContact("quote");
              closeMenu();
            }}
            className="btn-cta mt-3"
          >
            Get a Quote
          </a>
        </div>
      </nav>
    </header>
  );
};

export default Header;
