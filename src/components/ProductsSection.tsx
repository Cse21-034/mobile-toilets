import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import toiletStandard from "@/assets/toilet-standard.jpg";
import toiletVip from "@/assets/toilet-vip.jpg";
import toiletAccessible from "@/assets/toilet-accessible.jpg";

const products = [
  {
    name: "Standard Portable Toilet",
    image: toiletStandard,
    description: "Our most popular option for construction sites and outdoor events.",
    features: [
      "Durable construction",
      "Non-slip flooring",
      "Ventilation system",
      "Hand sanitizer dispenser",
    ],
    ideal: "Construction sites, small events",
  },
  {
    name: "VIP Luxury Toilet Trailer",
    image: toiletVip,
    description: "Premium mobile restroom with upscale amenities for special occasions.",
    features: [
      "Flushing toilet",
      "Running water sink",
      "Mirror & lighting",
      "Climate control available",
    ],
    ideal: "Weddings, corporate events, VIP areas",
  },
  {
    name: "Accessible Toilet Unit",
    image: toiletAccessible,
    description: "Spacious wheelchair-accessible unit meeting disability access requirements.",
    features: [
      "Wide doorway access",
      "Interior grab rails",
      "Lowered fixtures",
      "Extra interior space",
    ],
    ideal: "Public events, inclusive facilities",
  },
];

const ProductsSection = () => {
  const scrollToContact = () => {
    const element = document.getElementById("contact");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="products" className="section-padding bg-muted">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-secondary font-semibold uppercase tracking-wider text-sm">
            Our Fleet
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Mobile Toilet Options
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose from our range of high-quality portable toilets to meet your specific needs 
            and budget requirements.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div
              key={product.name}
              className="bg-card rounded-2xl overflow-hidden group"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  Available
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                  {product.name}
                </h3>
                <p className="text-muted-foreground mb-4">{product.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-4">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-secondary" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Ideal For */}
                <p className="text-sm text-muted-foreground mb-5">
                  <strong className="text-foreground">Ideal for:</strong> {product.ideal}
                </p>

                <Button
                  onClick={scrollToContact}
                  className="w-full hero-gradient text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Request Quote
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
