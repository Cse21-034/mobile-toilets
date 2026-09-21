import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import serviceDelivery from "@/assets/service-delivery.jpg";
import serviceHygiene from "@/assets/service-hygiene.jpg";
import serviceFlexible from "@/assets/service-flexible.jpg";
import serviceMaintenance from "@/assets/service-maintenance.jpg";
import serviceEvents from "@/assets/service-events.jpg";
import serviceEco from "@/assets/service-eco.jpg";

const services = [
  {
    image: serviceDelivery,
    title: "Fast Delivery",
    description: "Quick and efficient delivery to your location anywhere in the region.",
  },
  {
    image: serviceHygiene,
    title: "Hygienic & Clean",
    description: "All units are thoroughly sanitized and maintained to the highest standards.",
  },
  {
    image: serviceFlexible,
    title: "Flexible Rentals",
    description: "Daily, weekly, or monthly rental options to suit your project timeline.",
  },
  {
    image: serviceMaintenance,
    title: "Regular Servicing",
    description: "Scheduled maintenance and cleaning throughout your rental period.",
  },
  {
    image: serviceEvents,
    title: "Event Specialists",
    description: "Experienced in handling large events, festivals, and construction sites.",
  },
  {
    image: serviceEco,
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
          {services.map(({ image, title, description }, index) => (
            <Reveal key={title} delay={(index % 3) * 80} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-elevated">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={image}
                    alt=""
                    width={512}
                    height={512}
                    loading="lazy"
                    decoding="async"
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
