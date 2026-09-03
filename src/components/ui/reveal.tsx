import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Fades a block up as it enters the viewport, once.
 *
 * Position is measured with getBoundingClientRect on scroll rather than with an
 * IntersectionObserver: in embedded webviews the observer can simply never fire,
 * and content that starts at opacity 0 would then stay invisible forever.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  threshold = 0.9,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Fraction of the viewport height an element must reach before it shows.
      Lower means it waits longer, which is how the career rail gets its
      one-at-a-time entrance instead of a whole screenful at once. */
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      const r = el.getBoundingClientRect();
      // Only the top edge is tested. An earlier version also required
      // `r.bottom > 0`, which meant anything scrolled *past* between two checks
      // never revealed at all: one long jump (a deep link, a fling, a
      // programmatic scroll) took the element from below the line to above the
      // viewport in a single event, and it stayed at opacity 0 for good.
      // Measured it happening on the career rail - five items scrolled past,
      // all still invisible at the bottom of the page.
      if (r.top < window.innerHeight * threshold) {
        setShown(true);
        return true;
      }
      return false;
    };

    if (check()) return;

    const onMove = () => {
      if (check()) cleanup();
    };
    const cleanup = () => {
      window.removeEventListener("scroll", onMove);
      window.removeEventListener("resize", onMove);
      window.clearInterval(poll);
    };

    // Scroll events alone are not enough: arriving straight at #contact, or a
    // programmatic jump, moves the element into view without firing one. A
    // short diffed poll covers those and stops the moment it has hit.
    const poll = window.setInterval(onMove, 400);
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove);
    return cleanup;
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-out will-change-transform",
        shown ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
