import { Facebook, Instagram, X, Youtube, type LucideIcon } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import TikTokIcon from "@/components/icons/TikTokIcon";

export type SocialLink = {
  name: string;
  href: string;
  Icon: LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;
  /** Tailwind classes applied on hover/focus: each platform's own brand colour, icon turns white (or black for X) */
  hoverClass: string;
};

/**
 * Official profile links. Icons stay neutral until hover/focus, when each one picks up
 * its platform's own brand colour, so the row reads as one set at rest.
 */
export const socialLinks: SocialLink[] = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/solidcaremobileT",
    Icon: Facebook,
    hoverClass: "hover:bg-[#1877F2] hover:text-white",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/solidcare_mobile_toilets/?hl=en",
    Icon: Instagram,
    hoverClass: "hover:bg-[linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)] hover:text-white",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@solidcare_mobile_toilets",
    Icon: TikTokIcon,
    hoverClass: "hover:bg-[linear-gradient(135deg,#25f4ee,#fe2c55)] hover:text-white",
  },
  {
    name: "X",
    href: "https://x.com/SolidcareToilet",
    Icon: X,
    hoverClass: "hover:bg-white hover:text-black",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@SolidcareMobileToilets",
    Icon: Youtube,
    hoverClass: "hover:bg-[#FF0000] hover:text-white",
  },
];
