import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { cn } from "@/lib/utils";
import fleetTrailer from "@/assets/fleet-trailer.jpg";
import fleetRow from "@/assets/toilet1.jpg";
import interiorSink from "@/assets/interior-sink.jpg";
import interiorToilet from "@/assets/inside1.jpg";

type Photo = {
  src: string;
  width: number;
  height: number;
  caption: string;
  /** Grid placement classes */
  className?: string;
};

const photos: Photo[] = [
  {
    src: fleetTrailer,
    width: 1400,
    height: 933,
    caption: "VIP trailer with separate ladies & gents doors",
    className: "sm:col-span-2 md:row-span-2",
  },
  {
    src: fleetRow,
    width: 1080,
    height: 720,
    caption: "Trailer units on site",
    className: "md:col-span-2",
  },
  {
    src: interiorSink,
    width: 1200,
    height: 800,
    caption: "Interior with hand basin and soap dispenser",
  },
  {
    src: interiorToilet,
    width: 752,
    height: 1020,
    caption: "Flush toilet interior with natural light",
  },
];

const GallerySection = () => {
  const [selected, setSelected] = useState<Photo | null>(null);

  return (
    <section id="gallery" className="section-padding bg-background">
      <div className="container">
        <SectionHeader
          eyebrow="Our Units"
          title="See our units up close"
          description="Real photos of our trailers and interiors. Tap any photo to view it larger."
        />

        <div className="grid auto-rows-[16rem] gap-4 sm:grid-cols-2 md:auto-rows-[14rem] md:grid-cols-4 lg:auto-rows-[17rem]">
          {photos.map((photo, index) => (
            <Reveal key={photo.src} delay={index * 80} className={cn("h-full", photo.className)}>
              <button
                type="button"
                onClick={() => setSelected(photo)}
                aria-haspopup="dialog"
                className="focus-ring group relative block h-full w-full overflow-hidden rounded-2xl bg-muted text-left shadow-card"
              >
                <img
                  src={photo.src}
                  alt=""
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-4 pb-4 pt-12 text-sm font-semibold text-white">
                  {photo.caption}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-foreground opacity-0 shadow-soft transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  <Maximize2 className="h-4 w-4" />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
          {selected && (
            <>
              <div className="border-b px-5 py-4 pr-14">
                <DialogTitle className="text-base font-semibold leading-snug">{selected.caption}</DialogTitle>
                <DialogDescription className="sr-only">Enlarged photo of the Solidcare fleet</DialogDescription>
              </div>
              <img
                src={selected.src}
                alt={selected.caption}
                width={selected.width}
                height={selected.height}
                className="max-h-[75vh] w-full bg-muted object-contain"
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default GallerySection;
