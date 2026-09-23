import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import type { ContactIntent } from "@/lib/site";

const steps = [
  {
    title: "Request a quote",
    description:
      "Tell us your event date, location, rental period and how many units you need. We'll send a customised quote within 24 hours.",
  },
  {
    title: "We deliver & set up",
    description: "Clean, sanitised units are delivered to your location quickly and set up ready for use.",
  },
  {
    title: "We service & collect",
    description:
      "We handle scheduled cleaning and maintenance throughout your rental, then collect the units when you're done.",
  },
];

type HowItWorksProps = {
  onNavigateContact: (intent: ContactIntent) => void;
};

const HowItWorks = ({ onNavigateContact }: HowItWorksProps) => {
  return (
    <section id="how-it-works" className="section-padding hero-gradient on-dark relative overflow-hidden text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-cta/10 blur-3xl" />

      <div className="container relative">
        <SectionHeader
          tone="dark"
          eyebrow="Simple Process"
          title="How it works"
          description="From your first message to the last collection, we keep hiring a mobile toilet straightforward."
        />

        <ol className="relative grid gap-6 md:grid-cols-3 lg:gap-8">
          {steps.map(({ title, description }, index) => (
            <li key={title}>
              <Reveal delay={index * 100} className="h-full">
                <div className="h-full rounded-2xl border border-white/15 bg-white/[0.06] p-7 backdrop-blur-sm">
                  <span aria-hidden="true" className="text-5xl font-extrabold leading-none text-cta">
                    0{index + 1}
                  </span>
                  <h3 className="mt-5 text-xl font-bold">
                    <span className="sr-only">Step {index + 1}: </span>
                    {title}
                  </h3>
                  <p className="mt-2 text-white/80">{description}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="mt-12 text-center">
          <a href="#contact" onClick={() => onNavigateContact("quote")} className="btn-cta px-8 py-4 text-base">
            Start with a free quote
          </a>
        </Reveal>
      </div>
    </section>
  );
};

export default HowItWorks;
