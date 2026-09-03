import { useEffect, useState } from "react";

/**
 * True once the hero has scrolled out from under the header.
 *
 * The header sits on two different worlds — a light studio portrait, then the
 * dark page — so it needs to know which one is behind it, not merely that some
 * scrolling has happened. Measured against the hero's own bottom edge rather
 * than a fixed pixel count, so it stays correct at any viewport height.
 */
export function usePastHero(headerHeight = 72) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const check = () => {
      const hero = document.getElementById("top");
      const bottom = hero
        ? hero.getBoundingClientRect().bottom
        : window.innerHeight;
      const next = bottom <= headerHeight;
      setPast((current) => (current === next ? current : next));
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [headerHeight]);

  return past;
}
