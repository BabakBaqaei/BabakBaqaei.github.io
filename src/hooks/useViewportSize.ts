import { useEffect } from "react";

/**
 * Publishes the live viewport size as `--app-vw` / `--app-vh` on :root.
 *
 * Why not just use `100vh` / `100dvh`: inside an embedded webview the pane can
 * change size **without the page ever receiving a `resize` event** — measured
 * here, the visual viewport went 673x794 -> 1200x500 -> 900x1000 while every
 * resize listener stayed silent. The page keeps its old layout, the pane paints
 * the new area, and the leftover strip shows a frozen copy of the old frame.
 *
 * So the size is observed rather than listened for: a ResizeObserver on the
 * root element catches box changes the events miss, and a cheap diffed poll
 * backs it up for engines where neither fires. Writes only happen when the
 * numbers actually change, so there is no layout thrash.
 */
export function useViewportSize() {
  useEffect(() => {
    const root = document.documentElement;
    let lastW = -1;
    let lastH = -1;

    const apply = () => {
      const vv = window.visualViewport;
      const w = Math.round(vv?.width ?? window.innerWidth);
      const h = Math.round(vv?.height ?? window.innerHeight);
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      root.style.setProperty("--app-vw", `${w}px`);
      root.style.setProperty("--app-vh", `${h}px`);
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(root);

    const poll = window.setInterval(apply, 250);

    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    window.visualViewport?.addEventListener("resize", apply);

    return () => {
      observer.disconnect();
      window.clearInterval(poll);
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
      window.visualViewport?.removeEventListener("resize", apply);
    };
  }, []);
}
