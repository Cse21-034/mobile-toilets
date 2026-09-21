import { cn } from "@/lib/utils";

type LogoProps = {
  /** "light" is for dark backgrounds */
  variant?: "dark" | "light";
  className?: string;
};

/** Brand lockup: the circular mark from the logo plus a live-text wordmark that stays crisp at any size. */
const Logo = ({ variant = "dark", className }: LogoProps) => {
  const light = variant === "light";

  return (
    <span className={cn("flex items-center gap-3", className)}>
      <img
        src={light ? "/logo-mark-light.png" : "/logo-mark.png"}
        alt=""
        width={241}
        height={234}
        className="h-10 w-auto"
      />
      <span className={cn("flex flex-col leading-none", light ? "text-white" : "text-foreground")}>
        <span className="font-heading text-[1.2rem] tracking-[0.2em]">
          <span className="font-extrabold">SOLID</span>
          <span className="font-normal">CARE</span>
        </span>
        <span
          className={cn(
            "mt-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.3em]",
            light ? "text-[hsl(187_65%_60%)]" : "text-primary",
          )}
        >
          Rental Services
        </span>
      </span>
    </span>
  );
};

export default Logo;
