import { useEffect, useState } from "react";
import { FileText, MessageCircle, Phone } from "lucide-react";
import { site, whatsappLink, type ContactIntent } from "@/lib/site";
import { cn } from "@/lib/utils";

type StickyContactBarProps = {
  onNavigateContact: (intent: ContactIntent) => void;
};

/** Thumb-reach call / WhatsApp / quote bar for phones and tablets. Slides in once the visitor scrolls past the top. */
const StickyContactBar = ({ onNavigateContact }: StickyContactBarProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const itemClass =
    "focus-ring flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10";

  return (
    <nav
      aria-label="Quick contact"
      className={cn(
        "on-dark fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[hsl(190_45%_7%/0.96)] pb-[env(safe-area-inset-bottom)] backdrop-blur transition-[transform,visibility] duration-300 lg:hidden",
        visible ? "visible translate-y-0" : "invisible translate-y-full",
      )}
    >
      <div className="container grid grid-cols-3 gap-2 py-2">
        <a href={`tel:${site.phones[0].tel}`} className={itemClass}>
          <Phone className="h-5 w-5" aria-hidden="true" />
          Call
        </a>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={itemClass}>
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          WhatsApp
        </a>
        <a
          href="#contact"
          onClick={() => onNavigateContact("quote")}
          className="focus-ring flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl bg-cta px-2 py-1.5 text-xs font-bold text-cta-foreground transition-colors hover:bg-cta-hover"
        >
          <FileText className="h-5 w-5" aria-hidden="true" />
          Get Quote
        </a>
      </div>
    </nav>
  );
};

export default StickyContactBar;
