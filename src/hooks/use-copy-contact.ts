import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * mailto:/tel: links only do something if the device has a default mail or phone app — on many
 * desktops a click silently does nothing. This returns an onClick handler that leaves the link
 * working as normal (phones and set-up desktops still open their app) but, on desktop, also
 * copies the address/number and says so, so the click is never a dead end.
 */
export function useCopyContact() {
  const { toast } = useToast();

  return useCallback(
    (value: string, kind: "email" | "phone") => () => {
      // Touch devices open the dialer / mail app reliably; a toast there would just be noise.
      if (window.matchMedia?.("(pointer: coarse)").matches) return;
      if (!navigator.clipboard) return;

      navigator.clipboard
        .writeText(value)
        .then(() =>
          toast({
            title: kind === "email" ? "Email address copied" : "Phone number copied",
            description:
              kind === "email"
                ? `${value} — paste it into your email if your mail app didn't open.`
                : `${value} — call or WhatsApp us on this number.`,
          }),
        )
        .catch(() => {
          // Clipboard blocked (e.g. permissions) — the link itself still works where supported.
        });
    },
    [toast],
  );
}
