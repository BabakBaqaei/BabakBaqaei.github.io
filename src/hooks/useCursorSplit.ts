import { useEffect } from "react";

/**
 * How far across the screen the cursor has to travel before the label on the
 * opposite side is fully gone. 0.8 means the fade completes at 80% / 20% of the
 * width rather than at the very edge — you no longer have to shove the pointer
 * into the corner to clear a label.
 */
const FADE_AT = 0.8;

/** Leaving is quick; coming back is slow enough to read as an animation. */
const OUT_MS = 110;
const IN_MS = 460;

/** Cursor fraction (0..1) to the opacity of the label on `side`. */
function opacityFor(fraction: number, side: "left" | "right"): number {
  // Distance travelled away from centre, toward the *other* side, as 0..1.
  const away =
    side === "left"
      ? (fraction - 0.5) / (FADE_AT - 0.5)
      : (0.5 - fraction) / (FADE_AT - 0.5);
  return 1 - Math.min(1, Math.max(0, away));
}

/**
 * Publishes `--op-left` / `--op-right` and their matching transition durations
 * on :root from the cursor's horizontal position: dead centre leaves both
 * labels fully lit, and travelling to one side fades the label on the *other*
 * side out entirely.
 *
 * The duration is written per side and flips with direction, which is the only
 * way to get an asymmetric feel out of a continuously-driven value: the same
 * variable animates the opacity and (in RoleLabels) the blur, so a label snaps
 * away and then resolves back out of a blur instead of just reappearing.
 *
 * Written as CSS variables rather than React state on purpose — this fires on
 * every mouse move, and a re-render per event to animate two opacities would be
 * wasteful.
 */
export function useCursorSplit() {
  useEffect(() => {
    const root = document.documentElement;
    const previous = { left: 1, right: 1 };

    const publish = (side: "left" | "right", next: number) => {
      const duration = next < previous[side] ? OUT_MS : IN_MS;
      previous[side] = next;
      root.style.setProperty(`--op-${side}`, String(next));
      root.style.setProperty(`--dur-${side}`, `${duration}ms`);
    };

    const onMove = (event: MouseEvent) => {
      const fraction = event.clientX / window.innerWidth;
      publish("left", opacityFor(fraction, "left"));
      publish("right", opacityFor(fraction, "right"));
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
}
