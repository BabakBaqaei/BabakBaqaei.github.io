import { BackgroundVideo } from "@/components/BackgroundVideo";
import { RoleLabels } from "@/components/RoleLabels";

/**
 * Full-height opening: the mouse-tracked portrait with the two role labels.
 *
 * The clip is absolutely positioned inside this section rather than fixed to
 * the viewport, so it scrolls away with the hero instead of sitting under the
 * rest of the page.
 */
export function PortraitHero() {
  return (
    <section
      id="top"
      className="relative h-[var(--app-vh)] w-full overflow-hidden"
    >
      <BackgroundVideo />
      <RoleLabels />

      {/* Dissolves the bright studio grey into the dark page below. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-b from-transparent to-background md:h-56"
      />
    </section>
  );
}
