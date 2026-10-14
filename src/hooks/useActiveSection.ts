import { useEffect, useState } from "react";

/**
 * The id of the section the reader is in: the last of `ids` whose top has
 * passed 40% of the viewport. Drives the active state of the tab bar, the
 * side menu and the header links.
 *
 * Measured with getBoundingClientRect on scroll plus a poll, as everywhere on
 * this site - anchor jumps and programmatic scrolls fire no scroll event in
 * some webviews, and an IntersectionObserver may never fire at all.
 */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join(",");

  useEffect(() => {
    const list = key.split(",");
    let last = "";
    const check = () => {
      const line = window.innerHeight * 0.4;
      let now = list[0];
      for (const id of list) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) now = id;
      }
      if (now !== last) {
        last = now;
        setActive(now);
      }
    };
    check();
    const poll = window.setInterval(check, 300);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.clearInterval(poll);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [key]);

  return active;
}

/** 0..1 through the whole document, for the reading-progress hairline. */
export function useScrollFraction() {
  const [f, setF] = useState(0);
  useEffect(() => {
    let last = -1;
    const check = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const now = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (Math.abs(now - last) > 0.001) {
        last = now;
        setF(now);
      }
    };
    check();
    const poll = window.setInterval(check, 300);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.clearInterval(poll);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);
  return f;
}
