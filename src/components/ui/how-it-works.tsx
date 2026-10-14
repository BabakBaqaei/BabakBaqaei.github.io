import React, { useEffect, useState } from "react";
import { LazyMotion, domAnimation, m } from "motion/react";
import { useScrollPresence, useScrollProgress } from "@/hooks/useScrollPresence";
import { cn } from "@/lib/utils";

/**
 * Pinned cards on a dashed, flowing path - the component Babak supplied
 * ("how-it-works"), kept in structure (Pin, Card, positions, the looping
 * dashed path) and re-dressed for this site:
 *
 *  - dark glass instead of white paper: a frosted outer card, a tinted inner
 *    pane, the theme colours taken from the hero's paint palette so the page
 *    reads as one piece (violet = hotel, mustard = markets, teal = web);
 *  - sized to the old Experience rail's footprint: five cards in a 640px
 *    column, ~600px tall, instead of the original 1000x1130 board;
 *  - cards arrive as they scroll in and leave as they scroll out, both ways,
 *    every pass (`useScrollPresence`), and the path draws itself along with
 *    the scroll and un-draws on the way back (`useScrollProgress`). Measured
 *    with getBoundingClientRect, never `whileInView` / IntersectionObserver.
 *
 * Below `lg` the board becomes a plain stack: no path, no tilt.
 */

export type CardTheme = "violet" | "amber" | "teal";

const THEMES: Record<CardTheme, { bg: string; text: string; border: string; glow: string }> = {
  violet: {
    bg: "bg-[#a98bff]/[0.08]",
    text: "text-[#b9a1ff]",
    border: "border-[#a98bff]/20",
    glow: "shadow-[0_18px_50px_-20px_rgba(169,139,255,0.45)]",
  },
  amber: {
    bg: "bg-[#e2b055]/[0.08]",
    text: "text-[#e9c27a]",
    border: "border-[#e2b055]/20",
    glow: "shadow-[0_18px_50px_-20px_rgba(226,176,85,0.4)]",
  },
  teal: {
    bg: "bg-[#93bec0]/[0.08]",
    text: "text-[#a9d2d4]",
    border: "border-[#93bec0]/20",
    glow: "shadow-[0_18px_50px_-20px_rgba(147,190,192,0.4)]",
  },
};

interface CardProps {
  number: string;
  eyebrow?: string;
  title: string;
  description: string;
  colorTheme?: CardTheme;
  className?: string;
  rotate?: number;
  style?: React.CSSProperties;
}

const Pin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
);

const Card = ({ number, eyebrow, title, description, colorTheme = "violet", className, rotate = 0, style }: CardProps) => {
  const t = THEMES[colorTheme];
  const [ref, present] = useScrollPresence<HTMLLIElement>(0.92, 0.06);

  return (
    <li ref={ref} data-present={present} className={cn("relative w-full lg:w-[280px] hover:z-30", className)} style={style}>
      <m.div
        initial={false}
        animate={
          present
            ? { opacity: 1, y: 0, rotate, scale: 1, filter: "blur(0px)" }
            : { opacity: 0, y: 36, rotate: rotate * 2.2, scale: 0.94, filter: "blur(6px)" }
        }
        transition={{ type: "spring", stiffness: 140, damping: 20, mass: 0.9 }}
        whileHover={{ scale: 1.04, rotate: 0 }}
        className={cn(
          "glass rounded-[22px] p-2 transition-shadow duration-300",
          t.glow,
        )}
      >
        <Pin className={cn("relative z-20 mx-auto mb-2 h-5 w-5", t.text)} />
        <div className={cn("relative flex flex-col overflow-hidden rounded-[15px] border px-4 py-3.5", t.bg, t.border)}>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <span className={cn("font-mono text-2xl leading-none", t.text)}>{number}</span>
            {eyebrow && (
              <span className="font-mono text-[0.66rem] tracking-[0.14em] text-foreground/55 uppercase">
                {eyebrow}
              </span>
            )}
          </div>
          <h3 className="mb-1.5 text-[1.05rem] leading-snug font-semibold text-foreground">{title}</h3>
          <p className="text-[0.82rem] leading-5 tracking-tight text-foreground/60">{description}</p>
        </div>
      </m.div>
    </li>
  );
};

export interface Step {
  title: string;
  description: string;
  eyebrow?: string;
  colorTheme?: CardTheme;
}

export interface StepPosition {
  /** lg+ placement inside the 640px board, in px. */
  left: number;
  top: number;
  rotate?: number;
}

export interface HowItWorksProps {
  features: Step[];
  className?: string;
  stepPositions?: StepPosition[];
}

/**
 * Zig-zag down two columns of a 640px board. Tops come from the measured card
 * heights at lg (158 / 204 / 178 / 181 / 181 px, 280 wide) so that, tilted,
 * no two cards in a column come within ~30px of each other.
 */
const DEFAULT_CARD_POSITIONS: StepPosition[] = [
  { left: 0, top: 0, rotate: 3 },
  { left: 360, top: 96, rotate: -3 },
  { left: 0, top: 200, rotate: 3 },
  { left: 360, top: 330, rotate: -3 },
  { left: 0, top: 410, rotate: 3 },
];
const BOARD_W = 640;
const BOARD_H = 604;

/**
 * Card centres ~(140, y) on the left and ~(500, y) on the right; the path
 * leaves each card from its inner edge, swings out under the next one and
 * loops back, so it shows in the gaps and hides beneath the cards.
 */
const PATH_D =
  "M 282 79 C 410 79, 390 198, 500 198 " +
  "C 660 198, 440 268, 282 289 " +
  "C 410 289, 390 420, 500 420 " +
  "C 660 420, 440 482, 282 500";

/** The board (absolute cards, tilt, path) only exists from `lg` up. */
function useIsLg() {
  const [lg, setLg] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setLg(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return lg;
}

export default function HowItWorks({ features, className, stepPositions }: HowItWorksProps) {
  const positions = stepPositions || DEFAULT_CARD_POSITIONS;
  const isLg = useIsLg();
  const [boardRef, progress] = useScrollProgress<HTMLDivElement>(0.85, 0.35);

  return (
    <LazyMotion features={domAnimation}>
      <div className={cn("relative", className)}>
        <div
          ref={boardRef}
          className="relative mx-auto w-full lg:h-[var(--board-h)] lg:w-[var(--board-w)]"
          style={{ "--board-h": `${BOARD_H}px`, "--board-w": `${BOARD_W}px` } as React.CSSProperties}
        >
          {features.length > 1 && (
            <svg
              className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full lg:block"
              viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
              aria-hidden
            >
              <defs>
                {/* Draws the path with the scroll, both ways. */}
                <mask id="hiw-reveal">
                  <path
                    d={PATH_D}
                    stroke="#fff"
                    strokeWidth={8}
                    fill="none"
                    pathLength={1}
                    strokeDasharray="1 1"
                    strokeDashoffset={1 - progress}
                  />
                </mask>
              </defs>
              <g mask="url(#hiw-reveal)">
                <m.path
                  d={PATH_D}
                  stroke="currentColor"
                  className="text-[#a98bff]/45"
                  strokeWidth="2"
                  strokeDasharray="8 6"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -140 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </g>
            </svg>
          )}

          <ol className="relative z-10 flex flex-col gap-5 lg:block">
            {features.map((step, index) => {
              const position = positions[index % positions.length];
              return (
                <Card
                  key={step.title + index}
                  number={`0${index + 1}`}
                  eyebrow={step.eyebrow}
                  title={step.title}
                  description={step.description}
                  colorTheme={step.colorTheme || "violet"}
                  rotate={isLg ? position.rotate : 0}
                  className="lg:absolute lg:left-[var(--x)] lg:top-[var(--y)]"
                  style={{ "--x": `${position.left}px`, "--y": `${position.top}px` } as React.CSSProperties}
                />
              );
            })}
          </ol>
        </div>
      </div>
    </LazyMotion>
  );
}
