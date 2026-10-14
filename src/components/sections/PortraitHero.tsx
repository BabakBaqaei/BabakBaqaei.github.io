import { HeroLayers } from "@/components/HeroLayers";
import { RoleLabels } from "@/components/RoleLabels";

/**
 * Full-height opening: the cursor-wiped portrait with the two role labels.
 *
 * The stills are absolutely positioned inside this section rather than fixed to
 * the viewport, so it scrolls away with the hero instead of sitting under the
 * rest of the page.
 */
export function PortraitHero() {
  return (
    <section
      id="top"
      className="relative h-[var(--app-vh)] w-full overflow-hidden bg-white"
    >
      <HeroLayers />
      <RoleLabels />

      {/* Dissolves the white hero (and the suit) into the dark page below. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-background md:h-24"
      />
    </section>
  );
}
