import trailerEvent from "@/assets/trailer-event.jpg";
import trailerGrassSmall from "@/assets/trailer-grass-small.jpg";
import trailerPark from "@/assets/trailer-park.jpg";
import sinkCloseup from "@/assets/sink-closeup.jpg";
import truckTowFront from "@/assets/truck-tow-front.jpg";
import trailerRoadside from "@/assets/trailer-roadside.jpg";
import trailerOpen from "@/assets/trailer-open.jpg";
import truckTowSide from "@/assets/truck-tow-side.jpg";
import fleetRow from "@/assets/toilet1.jpg";
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
  trailerEvent: {
    src: trailerEvent,
    width: 1600,
    height: 1067,
    alt: "Solidcare toilet trailer with ladies and gents doors set up at an outdoor event",
  },
  trailerGrassSmall: {
    src: trailerGrassSmall,
    width: 450,
    height: 331,
    alt: "Solidcare toilet trailer parked on grass",
  },
  trailerPark: {
    src: trailerPark,
    width: 1600,
    height: 1200,
    alt: "Solidcare VIP toilet trailer on a lawn with trees behind it",
  },
  sinkCloseup: {
    src: sinkCloseup,
    width: 1600,
    height: 1067,
    alt: "Hand basin with running water inside a Solidcare toilet trailer",
  },
  truckTowFront: {
    src: truckTowFront,
    width: 1600,
    height: 900,
    alt: "Solidcare truck towing a toilet trailer to a site",
  },
  trailerRoadside: {
    src: trailerRoadside,
    width: 1600,
    height: 900,
    alt: "Solidcare toilet trailer hitched and ready for delivery",
  },
  trailerOpen: {
    src: trailerOpen,
    width: 1600,
    height: 1067,
    alt: "Solidcare toilet trailer with both doors open, set up on grass",
  },
  truckTowSide: {
    src: truckTowSide,
    width: 1600,
    height: 900,
    alt: "Solidcare truck and toilet trailer on the road for delivery",
  },
  fleetRow: {
    src: fleetRow,
    width: 1080,
    height: 720,
    alt: "Row of Solidcare toilet trailers parked on site",
  },
  interiorToilet: {
    src: interiorToilet,
    width: 752,
    height: 1020,
    alt: "Flush toilet inside a Solidcare unit with a window and paper dispenser",
  },
} satisfies Record<string, Photo>;
