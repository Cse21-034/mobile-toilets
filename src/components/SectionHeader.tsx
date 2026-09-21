import Reveal from "@/components/Reveal";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  /** "dark" is for sections on a dark background */
  tone?: "light" | "dark";
  align?: "center" | "left";
  className?: string;
};

const SectionHeader = ({
  eyebrow,
  title,
  description,
  tone = "light",
  align = "center",
  className,
}: SectionHeaderProps) => {
  const dark = tone === "dark";

  return (
    <Reveal className={cn("mb-14 max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <span className={cn("eyebrow", dark ? "text-cta" : "text-secondary")}>{eyebrow}</span>
      <h2
        className={cn(
          "mt-3 text-3xl font-extrabold leading-tight md:text-4xl lg:text-[2.6rem]",
          dark ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 text-lg", dark ? "text-white/80" : "text-muted-foreground")}>{description}</p>
      )}
    </Reveal>
  );
};

export default SectionHeader;
