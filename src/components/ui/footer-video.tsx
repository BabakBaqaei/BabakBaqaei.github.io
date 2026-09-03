import { useEffect, useRef, useState } from "react";

const SRC = "/video/footer.mp4";

/**
 * The scrim only exists to hold text off the bright limb of the Earth, which
 * sits 55-80% of the way down the frame. It is zero at the very top of the
 * footer - where the boundary with the page is - and comes in over the empty
 * upper half, so it can never draw an edge there. Smoothstep and finely
 * sampled, because a stop in a gradient is a kink in the slope and the eye
 * finds kinks in a dark ramp very easily.
 */
const SCRIM_MAX = 0.45;
const SCRIM_END = 55;
const SCRIM_STEPS = 12;
const SCRIM = `linear-gradient(to bottom, ${Array.from(
  { length: SCRIM_STEPS + 1 },
  (_, i) => {
    const t = i / SCRIM_STEPS;
    const alpha = t * t * (3 - 2 * t) * SCRIM_MAX;
    return `rgba(5,5,8,${alpha.toFixed(4)}) ${(t * SCRIM_END).toFixed(2)}%`;
  },
).join(", ")}, rgba(5,5,8,${SCRIM_MAX}) 100%)`;

/**
 * Ambient clip behind the footer, held at 50% as asked.
 *
 * **It is blended, not laid over.** `mix-blend-screen` means the clip can only
 * ever add light: where a pixel is black the composite is exactly the page
 * behind it, untouched. That is the whole trick here. A normal 50% layer
 * *halves* whatever is under it, and the page under the footer is not black -
 * the fixed radial gradient is violet toward the bottom of the viewport, around
 * luma 40 - so a plain 50% clip darkened it by ~20 the moment the footer began,
 * and that step is the horizontal line that kept showing up at the boundary.
 * Every attempt to hide it with a fade only turned a line into a band.
 *
 * With screen there is nothing to hide: the clip's top fifth measures luma 0-0.4
 * (measured off the file, ten bands per frame), so at the footer's own top edge
 * it adds nothing at all and the page runs straight through. `object-top` keeps
 * that dark end at the boundary; the Earth limb stays in view lower down where
 * it is wanted.
 *
 * The file is deliberately not attached until the footer is close: `src` is set
 * only once the element comes within a screen's reach, so visitors who never
 * scroll that far never pay for it. Proximity is measured with
 * getBoundingClientRect on scroll plus a diffed poll - an IntersectionObserver
 * can simply never fire in embedded webviews, and the poll also covers deep
 * links and programmatic jumps, which fire no scroll event.
 *
 * Nothing may isolate this element from the page. `mix-blend-mode` blends with
 * whatever is painted beneath it in the nearest **stacking context**, and a
 * stacking context is cheap to create by accident - `isolation: isolate` on the
 * footer would do it, and so would a `z-index` on this very wrapper, which is
 * why it has none and the footer's content column is given `relative` to sit
 * above the clip instead. Isolate it and the blend silently falls back to
 * exactly the plain 50% overlay this replaced.
 *
 * If the browser refuses autoplay the layer simply stays dark - the footer
 * never depends on it for contrast.
 */
export function FooterVideo() {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      const rect = el.getBoundingClientRect();
      // one screen of runway, so it is decoded before it is looked at
      if (rect.top < window.innerHeight * 2 && rect.bottom > -window.innerHeight) {
        setLoad(true);
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

    const poll = window.setInterval(onMove, 400);
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove);
    return cleanup;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!load || !video) return;

    // Autoplay can be refused, and the first attempt can also land before the
    // element has enough data. Try now and again once it is ready; if the
    // browser still says no there is nothing to recover - the layer is decor.
    const start = () => video.play().catch(() => {});
    start();
    video.addEventListener("canplay", start);
    return () => video.removeEventListener("canplay", start);
  }, [load]);

  return (
    <div ref={ref} aria-hidden className="absolute inset-0 overflow-hidden">
      {load ? (
        <video
          ref={videoRef}
          src={SRC}
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover object-top opacity-50 mix-blend-screen"
        />
      ) : null}
      <div className="absolute inset-0" style={{ backgroundImage: SCRIM }} />
    </div>
  );
}
