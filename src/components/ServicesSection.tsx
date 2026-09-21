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
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-secondary font-semibold uppercase tracking-wider text-sm">
            What We Offer
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Our Professional Services
          </h2>
          <p className="text-muted-foreground text-lg">
            We provide comprehensive portable sanitation solutions with a commitment 
            to quality, reliability, and customer satisfaction.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="card-service group overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="w-full h-48 rounded-lg overflow-hidden mb-5">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
