import fleetTrailer from "@/assets/fleet-trailer.jpg";
import fleetRow from "@/assets/toilet1.jpg";
import interiorSink from "@/assets/interior-sink.jpg";
import interiorToilet from "@/assets/inside1.jpg";

export type Photo = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

/**
 * The real photos of our fleet. Every section that shows a unit photo (hero, services,
 * products, gallery) reads from here, so a photo is swapped in one place.
 */
export const photos = {
  fleetTrailer: {
    src: fleetTrailer,
    width: 1400,
    height: 933,
    alt: "White and silver Solidcare VIP toilet trailer with separate ladies and gents doors and access steps",
  },
  fleetRow: {
    src: fleetRow,
    width: 1080,
    height: 720,
    alt: "Row of Solidcare toilet trailers parked on site",
  },
  interiorSink: {
    src: interiorSink,
    width: 1200,
    height: 800,
    alt: "Toilet trailer interior with a hand basin and soap dispenser",
  },
  interiorToilet: {
    src: interiorToilet,
    width: 752,
    height: 1020,
    alt: "Flush toilet inside a Solidcare unit with a window and paper dispenser",
  },
} satisfies Record<string, Photo>;
