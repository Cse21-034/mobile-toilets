import { ArrowRight, BadgeCheck, Clock, Phone, Sparkles } from "lucide-react";
import { photos } from "@/lib/photos";
import { site } from "@/lib/site";

const highlights = [
  { icon: Sparkles, text: "Clean, well-maintained facilities for all occasions" },
  { icon: Clock, text: "24/7 availability and rapid on-site delivery" },
  { icon: BadgeCheck, text: "Affordable pricing with professional service" },
];

const HeroSection = () => {
  const phone = site.phones[0];

  return (
    <section
      id="home"
      className="hero-gradient on-dark relative overflow-hidden pb-20 pt-28 text-white lg:pb-28 lg:pt-36"
    >
      {/* Decorative background: soft glows and a faint dot grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-cta/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-[26rem] w-[26rem] rounded-full bg-secondary/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(hsl(0 0% 100%) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="container relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <h1 className="text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-[3.5rem]">
            Clean, reliable mobile toilets for <span className="text-cta">every event and site</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-white/80">
            Elevate your event experience with premium, hygienic and reliable portable sanitation — from intimate
            gatherings to large-scale events, construction sites and festivals. We&rsquo;ve got you covered.
          </p>

          <ul className="mt-8 space-y-3.5">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-cta ring-1 ring-white/15">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-white/90">{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href="#contact" className="btn-cta px-8 py-4 text-base">
              Request a Quote
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
            <a href={`tel:${phone.tel}`} className="btn-outline-light px-8 py-4 text-base">
              <Phone className="h-5 w-5" aria-hidden="true" />
              Call {phone.display}
            </a>
          </div>
        </div>

        {/* Real photo of the fleet with two supporting facts taken from the site copy */}
        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div aria-hidden="true" className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-cta/40 to-transparent blur-2xl" />
          <img
            src={photos.fleetTrailer.src}
            width={photos.fleetTrailer.width}
            height={photos.fleetTrailer.height}
            alt={photos.fleetTrailer.alt}
            className="relative aspect-[3/2] w-full rounded-3xl object-cover shadow-elevated ring-1 ring-white/20"
          />
          <div className="absolute -top-4 right-4 rounded-full bg-cta px-4 py-2 text-sm font-bold text-cta-foreground shadow-card">
            Daily · Weekly · Monthly rentals
          </div>
          <div className="absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl bg-card px-4 py-3 text-card-foreground shadow-elevated sm:left-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Clock className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">Quote within 24 hours</p>
              <p className="text-xs text-muted-foreground">Tell us your date and location</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
