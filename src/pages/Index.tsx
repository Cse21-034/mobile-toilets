import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import ProductsSection from "@/components/ProductsSection";
import HowItWorks from "@/components/HowItWorks";
import GallerySection from "@/components/GallerySection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import StickyContactBar from "@/components/StickyContactBar";
import { type ContactIntent, type ContactRequest, type ToiletType } from "@/lib/site";

const Index = () => {
  const [contactRequest, setContactRequest] = useState<ContactRequest | null>(null);

  // Choosing a unit in "Our Toilets" opens the quote form with that type pre-selected
  const requestQuote = (type: ToiletType) => setContactRequest({ intent: "quote", toiletType: type, nonce: Date.now() });
  // "Get a Quote" / "Contact" links elsewhere just pick which form to show
  const navigateContact = (intent: ContactIntent) => setContactRequest({ intent, nonce: Date.now() });

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-cta focus:px-4 focus:py-2 focus:font-semibold focus:text-cta-foreground"
      >
        Skip to main content
      </a>
      <Header onNavigateContact={navigateContact} />
      <main id="main">
        <HeroSection onNavigateContact={navigateContact} />
        <ServicesSection />
        <ProductsSection onRequestQuote={requestQuote} />
        <HowItWorks onNavigateContact={navigateContact} />
        <GallerySection />
        <ContactSection contactRequest={contactRequest} />
      </main>
      <Footer onNavigateContact={navigateContact} />
      <StickyContactBar onNavigateContact={navigateContact} />
    </div>
  );
};

export default Index;
