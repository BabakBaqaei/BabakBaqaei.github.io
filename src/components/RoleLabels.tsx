import { EDGE_PAD, LEFT_LABEL, RIGHT_LABEL } from "@/content/labels";

/**
 * The two role labels flanking the portrait.
 *
 * Positioned inside the hero section rather than fixed, so they leave with the
 * portrait instead of following the page.
 *
 * Placement lives in `.role-line` (index.css) because it is responsive: on
 * desktop each label sits on the measured eye line and inside the clear space
 * beside the head (`useFaceLayout`); below md they move to the foot of the
 * portrait, where there is room to stay readable.
 *
 * Opacity, blur and the transition duration all come from the variables
 * `useCursorSplit` writes, so the whole effect costs no React renders. The blur
 * is derived from the opacity rather than published separately — one number
 * driving both keeps them from ever disagreeing.
 */
/* Colour is set in `.role-line` because it flips between breakpoints. */
const BASE = "font-bold tracking-[-0.06em] leading-none whitespace-nowrap";

/** Blur at the moment a label is fully faded out. */
const BLUR_MAX = 16;

function fade(side: "left" | "right") {
  return {
    opacity: `var(--op-${side})`,
    filter: `blur(calc((1 - var(--op-${side})) * ${BLUR_MAX}px))`,
    transition: `opacity var(--dur-${side}, 160ms) linear, filter var(--dur-${side}, 160ms) cubic-bezier(0.16, 0.8, 0.3, 1)`,
    willChange: "opacity, filter",
  } as const;
}

export function RoleLabels() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[2]"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      <div className="role-line">
        <span className={BASE} style={{ ...fade("left"), left: `${EDGE_PAD}px` }}>
          {LEFT_LABEL}
        </span>

        <span
          className={BASE}
          style={{ ...fade("right"), right: `${EDGE_PAD}px` }}
        >
          {RIGHT_LABEL}
        </span>
      </div>
    </div>
  );
}
