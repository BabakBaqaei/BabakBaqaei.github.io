import { cn } from "@/lib/utils";
import { LOGO } from "@/content/site";

/**
 * The BB monogram.
 *
 * Two cuts of the same file: the white one for the dark page, the original ink
 * for the light studio portrait behind the hero. Height drives the size and
 * width follows the file's own ratio, so the mark can never be stretched.
 */
export function LogoMark({
  height,
  tone = "light",
  className,
}: {
  height: number;
  tone?: "light" | "ink";
  className?: string;
}) {
  return (
    <img
      src={tone === "ink" ? LOGO.original : LOGO.src}
      alt={LOGO.alt}
      width={Math.round(height * LOGO.ratio)}
      height={height}
      className={cn("block w-auto select-none", className)}
      style={{ height }}
      draggable={false}
    />
  );
}
