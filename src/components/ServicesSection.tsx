import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { photos, type Photo } from "@/lib/photos";

const services: {
  photo: Photo;
  /** CSS object-position, to choose which part of the photo the card crop shows */
  position?: string;
  /** Tighter crop, so a photo used twice looks different the second time */
  zoom?: { scale: number; origin: string };
  title: string;
  description: string;
}[] = [
  {
    photo: photos.fleetTrailer,
    title: "Fast Delivery",
    description: "Quick and efficient delivery to your location anywhere in the region.",
  },
  {
    photo: photos.interiorSink,
    title: "Hygienic & Clean",
    description: "All units are thoroughly sanitized and maintained to the highest standards.",
  },
  {
    photo: photos.fleetRow,
    title: "Flexible Rentals",
    description: "Daily, weekly, or monthly rental options to suit your project timeline.",
  },
  {
    photo: photos.interiorToilet,
    position: "50% 88%",
    title: "Regular Servicing",
    description: "Scheduled maintenance and cleaning throughout your rental period.",
  },
  {
    photo: photos.fleetRow,
    zoom: { scale: 1.5, origin: "78% 58%" },
    title: "Event Specialists",
    description: "Experienced in handling large events, festivals, and construction sites.",
  },
  {
    photo: photos.interiorSink,
    zoom: { scale: 1.9, origin: "55% 58%" },
    title: "Eco-Friendly",
    description: "Environmentally responsible waste management and disposal practices.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="section-padding bg-background">
      <div className="container">
        <SectionHeader
          eyebrow="What We Offer"
          title="Our Professional Services"
          description="We provide comprehensive portable sanitation solutions with a commitment to quality, reliability, and customer satisfaction."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {services.map(({ photo, position, zoom, title, description }, index) => (
            <Reveal key={title} delay={(index % 3) * 80} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-elevated">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={photo.src}
                    alt=""
                    width={photo.width}
                    height={photo.height}
                    loading="lazy"
                    decoding="async"
                    // `scale` is a separate CSS property, so it stacks with the hover zoom class.
                    // It must be a string: React would turn the number 1.5 into the invalid "1.5px".
                    style={{
                      objectPosition: position,
                      ...(zoom && { scale: `${zoom.scale}`, transformOrigin: zoom.origin }),
                    }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-bold text-foreground">{title}</h3>
                  <p className="mt-2 text-muted-foreground">{description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
