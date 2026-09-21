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
import { type QuoteRequest, type ToiletType } from "@/lib/site";

const Index = () => {
  // Choosing a unit in "Our Toilets" pre-selects it in the quote form
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);
  const requestQuote = (type: ToiletType) => setQuoteRequest({ type, nonce: Date.now() });

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-cta focus:px-4 focus:py-2 focus:font-semibold focus:text-cta-foreground"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main">
        <HeroSection />
        <ServicesSection />
        <ProductsSection onRequestQuote={requestQuote} />
        <HowItWorks />
        <GallerySection />
        <ContactSection quoteRequest={quoteRequest} />
      </main>
      <Footer />
      <StickyContactBar />
    </div>
  );
};

export default Index;
