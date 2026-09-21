import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import rotate1 from "@/assets/rotate1.jpg";
import rotate2 from "@/assets/rotate2.jpg";
import rotate3 from "@/assets/rotate3.jpg";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [rotate1, rotate2, rotate3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, [slides.length]);

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative mt-24 md:mt-28 py-12 md:py-16"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Side - Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Professional Mobile Toilet Solutions
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Elevate your event experience with our premium, hygienic, and reliable portable sanitation services. From intimate gatherings to large-scale events, construction sites to festivals – we've got you covered.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-accent font-bold text-xl">✓</span>
                <p className="text-foreground">Clean, well-maintained facilities for all occasions</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent font-bold text-xl">✓</span>
                <p className="text-foreground">24/7 availability and rapid on-site delivery</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent font-bold text-xl">✓</span>
                <p className="text-foreground">Affordable pricing with professional service</p>
              </div>
            </div>

            <Button
              onClick={scrollToContact}
              className="w-fit text-lg px-8 py-6 flex items-center gap-2"
            >
              Request a Quote
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Right Side - Slideshow */}
          <div className="flex justify-center md:justify-end">
            <div className="bg-black rounded-lg overflow-hidden max-w-sm w-full">
              <img
                src={slides[currentSlide]}
                alt="Slideshow"
                className="w-full object-contain transition-all duration-1000"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
