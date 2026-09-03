import { useEffect, useState } from "react";

/**
 * True once the window has scrolled past `threshold` pixels.
 *
 * Referenced by `header-1` but not shipped with it, so it is written here.
 * The listener is passive and the state only flips on a crossing, so the
 * header does not re-render on every scroll frame.
 */
export function useScroll(threshold = 0) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > threshold;
      setScrolled((current) => (current === past ? current : past));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
