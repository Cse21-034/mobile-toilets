import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { photos, type Photo } from "@/lib/photos";
import { cn } from "@/lib/utils";

type GalleryPhoto = Photo & {
  caption: string;
  /** Grid placement classes */
  className?: string;
};

const galleryPhotos: GalleryPhoto[] = [
  {
    ...photos.trailerOpen,
    caption: "Trailer set up with separate ladies & gents doors",
    className: "sm:col-span-2 md:row-span-2",
  },
  {
    ...photos.truckTowSide,
    caption: "On the road to your site",
    className: "md:col-span-2",
  },
  {
    ...photos.sinkCloseup,
    caption: "Hand basin with running water",
  },
  {
    ...photos.interiorToilet,
    caption: "Flush toilet interior with natural light",
  },
  {
    ...photos.trailerEvent,
    caption: "Ready for an outdoor event",
    className: "md:col-span-2",
  },
  {
    ...photos.fleetRow,
    caption: "Trailer units on site",
    className: "md:col-span-2",
  },
];

const SWIPE_THRESHOLD_PX = 50;

const GallerySection = () => {
  // Index of the photo open in the viewer, or null when it's closed
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex === null ? null : galleryPhotos[selectedIndex];
  const touchStartX = useRef<number | null>(null);

  // Wraps around, so "next" on the last photo goes back to the first
  const step = (delta: number) =>
    setSelectedIndex((index) =>
      index === null ? null : (index + delta + galleryPhotos.length) % galleryPhotos.length,
    );

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  };

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX) step(deltaX < 0 ? 1 : -1);
  };

  const navButtonClass =
    "focus-ring absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white shadow-soft backdrop-blur transition-colors hover:bg-black/75";

  return (
    <section id="gallery" className="section-padding bg-background">
      <div className="container">
        <SectionHeader
          eyebrow="Our Units"
          title="See our units up close"
          description="Real photos of our trailers and interiors. Tap any photo to view it larger."
        />

        <div className="grid auto-rows-[16rem] gap-4 sm:grid-cols-2 md:auto-rows-[14rem] md:grid-cols-4 lg:auto-rows-[17rem]">
          {galleryPhotos.map((photo, index) => (
            <Reveal key={photo.src} delay={index * 80} className={cn("h-full", photo.className)}>
              <button
                type="button"
                onClick={() => setSelectedIndex(index)}
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

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-2xl" onKeyDown={handleKeyDown}>
          {selected && selectedIndex !== null && (
            <>
              <div className="flex items-baseline gap-3 border-b px-5 py-4 pr-14">
                <DialogTitle className="text-base font-semibold leading-snug">{selected.caption}</DialogTitle>
                <span className="ml-auto shrink-0 text-sm tabular-nums text-muted-foreground" aria-live="polite">
                  {selectedIndex + 1} / {galleryPhotos.length}
                </span>
                <DialogDescription className="sr-only">
                  Enlarged photo of the Solidcare fleet. Use the left and right arrow keys to see other photos.
                </DialogDescription>
              </div>
              <div className="relative bg-muted" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <img
                  key={selected.src}
                  src={selected.src}
                  alt={selected.caption}
                  width={selected.width}
                  height={selected.height}
                  className="max-h-[75vh] w-full object-contain animate-in fade-in-0 duration-300"
                />
                <button type="button" onClick={() => step(-1)} className={cn(navButtonClass, "left-3")} aria-label="Previous photo">
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => step(1)} className={cn(navButtonClass, "right-3")} aria-label="Next photo">
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default GallerySection;
