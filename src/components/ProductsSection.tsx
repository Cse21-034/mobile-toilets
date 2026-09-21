import { Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { type ToiletType } from "@/lib/site";
import toiletStandard from "@/assets/toilet-standard.jpg";
import toiletVip from "@/assets/toilet-vip.jpg";
import toiletAccessible from "@/assets/toilet-accessible.jpg";

const products: {
  type: ToiletType;
  name: string;
  image: string;
  description: string;
  features: string[];
  ideal: string;
  badge?: string;
}[] = [
  {
    type: "standard",
    name: "Standard Portable Toilet",
    image: toiletStandard,
    description: "Our most popular option for construction sites and outdoor events.",
    features: ["Durable construction", "Non-slip flooring", "Ventilation system", "Hand sanitizer dispenser"],
    ideal: "Construction sites, small events",
    badge: "Most popular",
  },
  {
    type: "vip",
    name: "VIP Luxury Toilet Trailer",
    image: toiletVip,
    description: "Premium mobile restroom with upscale amenities for special occasions.",
    features: ["Flushing toilet", "Running water sink", "Mirror & lighting", "Climate control available"],
    ideal: "Weddings, corporate events, VIP areas",
  },
  {
    type: "accessible",
    name: "Accessible Toilet Unit",
    image: toiletAccessible,
    description: "Spacious wheelchair-accessible unit meeting disability access requirements.",
    features: ["Wide doorway access", "Interior grab rails", "Lowered fixtures", "Extra interior space"],
    ideal: "Public events, inclusive facilities",
  },
];

type ProductsSectionProps = {
  /** Called when a visitor picks a unit, so the quote form can pre-select it */
  onRequestQuote: (type: ToiletType) => void;
};

const ProductsSection = ({ onRequestQuote }: ProductsSectionProps) => {
  return (
    <section id="products" className="section-padding bg-muted">
      <div className="container">
        <SectionHeader
          eyebrow="Our Fleet"
          title="Mobile Toilet Options"
          description="Choose from our range of high-quality portable toilets to meet your specific needs and budget requirements."
        />

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {products.map((product, index) => (
            <Reveal key={product.type} delay={index * 90} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-elevated">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    width={1024}
                    height={768}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.badge && (
                    <span className="absolute left-4 top-4 rounded-full bg-cta px-3 py-1 text-sm font-bold text-cta-foreground shadow-soft">
                      {product.badge}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-bold text-foreground">{product.name}</h3>
                  <p className="mt-2 text-muted-foreground">{product.description}</p>

                  <ul className="mt-5 space-y-2.5">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-secondary/15 text-secondary">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* mt-auto pins this block to the card bottom so the buttons line up across cards */}
                  <div className="mt-auto pt-6">
                    <p className="flex items-start gap-2.5 rounded-xl bg-muted px-4 py-3 text-sm">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>
                        <span className="font-semibold text-foreground">Ideal for: </span>
                        <span className="text-muted-foreground">{product.ideal}</span>
                      </span>
                    </p>

                    <Button asChild size="lg" className="mt-4 h-12 w-full rounded-xl text-base font-semibold">
                      <a href="#contact" onClick={() => onRequestQuote(product.type)}>
                        Request this unit
                      </a>
                    </Button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
