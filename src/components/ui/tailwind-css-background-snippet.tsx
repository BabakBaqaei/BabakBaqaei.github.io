import { cn } from "@/lib/utils";

/**
 * The page background from the brief, kept exactly as specified:
 * radial-gradient(125% 125% at 50% 10%, #000 40%, #63e 100%)
 *
 * Split into a reusable layer, because the site needs it sitting behind
 * scrolling sections rather than as one standalone full-screen block.
 */
export const RadialBackground = ({ className }: { className?: string }) => (
  <div aria-hidden className={cn("absolute inset-0 -z-10", className)}>
    <div className="absolute inset-0 h-full w-full [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]" />
  </div>
);

/** Standalone full-screen version, matching the snippet in the brief. */
export const Hero = () => {
  return (
    <div className={cn("w-full relative h-screen")}>
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      </div>
    </div>
  );
};
