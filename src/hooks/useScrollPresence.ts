import { useEffect, useRef, useState } from "react";

/**
 * `true` while the element sits inside the viewport band, `false` once it has
 * left it - in either direction, every time. So content arrives on the way
 * down, leaves again on the way back up, and returns on the next pass.
 *
 * Measured with getBoundingClientRect on scroll plus a diffed poll, never an
 * IntersectionObserver: in embedded webviews the observer can simply never
 * fire, and content waiting on it would stay invisible for good.
 *
 * `enter` / `exit` are fractions of the viewport height: the element is
 * present while its top is above `enter` and its bottom is below `exit`.
 */
export function useScrollPresence<T extends HTMLElement>(enter = 0.9, exit = 0.08) {
  const ref = useRef<T>(null);
  const [present, setPresent] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let last: boolean | null = null;

    const check = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const now = r.top < vh * enter && r.bottom > vh * exit;
      if (now !== last) {
        last = now;
        setPresent(now);
      }
    };

    check();
    const poll = window.setInterval(check, 250);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.clearInterval(poll);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [enter, exit]);

  return [ref, present] as const;
}

/**
 * How far the element has travelled through the viewport, 0..1, following the
 * scroll both ways: 0 while its top is still below `start`, 1 once its bottom
 * has risen past `end`. Same measuring rules as above.
 */
export function useScrollProgress<T extends HTMLElement>(start = 0.85, end = 0.45) {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let last = -1;

    const check = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const from = vh * start - r.top;
      const span = r.height + vh * (start - end);
      const p = Math.max(0, Math.min(1, from / span));
      if (Math.abs(p - last) > 0.002) {
        last = p;
        setProgress(p);
      }
    };

    check();
    const poll = window.setInterval(check, 250);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.clearInterval(poll);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [start, end]);

  return [ref, progress] as const;
}
