import { useEffect } from "react";
import {
  EDGE_PAD,
  EYE_Y,
  FACE_GAP,
  HEAD_LEFT,
  HEAD_RIGHT,
  LABEL_MAX,
  LABEL_MIN,
  LEFT_LABEL,
  RIGHT_LABEL,
  VIDEO_H,
  VIDEO_W,
} from "../content/labels";

const TRACKING = "-0.06em";
const WEIGHT = 700;

/** Width of `text` at 100px in the display face, so it can be scaled linearly. */
function widthPer100(ctx: CanvasRenderingContext2D, text: string) {
  ctx.font = `${WEIGHT} 100px ${getComputedStyle(
    document.documentElement,
  ).getPropertyValue("--font-heading")}`;
  // Chrome honours this; where it is missing the tracking just isn't subtracted,
  // which only makes the fit more conservative.
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
    TRACKING;
  return ctx.measureText(text).width;
}

/**
 * Projects the measured face landmarks through the `object-fit: cover`
 * transform and publishes them as CSS variables:
 *
 *   --eye-y       screen y of the eye line
 *   --face-left   screen x where the head starts
 *   --face-right  screen x where the head ends
 *   --label-size  largest type size that still clears the head on both sides
 *
 * This is why the labels never land on the face: the clear space is derived
 * from the actual crop at the current viewport, not from a fixed percentage.
 */
export function useFaceLayout() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const root = document.documentElement;
    let leftPer100 = 0;
    let rightPer100 = 0;

    const measureText = () => {
      if (!ctx) return;
      leftPer100 = widthPer100(ctx, LEFT_LABEL);
      rightPer100 = widthPer100(ctx, RIGHT_LABEL);
    };

    const apply = () => {
      const vw = window.visualViewport?.width ?? window.innerWidth;
      const vh = window.visualViewport?.height ?? window.innerHeight;

      // object-fit: cover with object-position 50% 50%
      const scale = Math.max(vw / VIDEO_W, vh / VIDEO_H);
      const rw = VIDEO_W * scale;
      const rh = VIDEO_H * scale;
      const offsetX = (vw - rw) / 2;
      const offsetY = (vh - rh) / 2;

      const faceLeft = offsetX + HEAD_LEFT * rw;
      const faceRight = offsetX + HEAD_RIGHT * rw;
      const eyeY = offsetY + EYE_Y * rh;

      const leftRoom = faceLeft - EDGE_PAD - FACE_GAP;
      const rightRoom = vw - faceRight - EDGE_PAD - FACE_GAP;

      // Both labels share one size so the pair stays balanced.
      let size = LABEL_MAX;
      if (leftPer100 > 0 && rightPer100 > 0) {
        size = Math.min(
          LABEL_MAX,
          (leftRoom / leftPer100) * 100,
          (rightRoom / rightPer100) * 100,
        );
      }
      size = Math.max(LABEL_MIN, Math.floor(size));

      root.style.setProperty("--eye-y", `${Math.round(eyeY)}px`);
      root.style.setProperty("--face-left", `${Math.round(faceLeft)}px`);
      root.style.setProperty("--face-right", `${Math.round(faceRight)}px`);
      root.style.setProperty("--label-size", `${size}px`);
    };

    measureText();
    apply();

    // The webfont changes the metrics, so re-fit once it lands.
    document.fonts?.ready.then(() => {
      measureText();
      apply();
    });

    // Same reason as useViewportSize: resize events are not reliable in an
    // embedded webview, so the box is observed and polled instead.
    const observer = new ResizeObserver(apply);
    observer.observe(root);
    const poll = window.setInterval(apply, 250);
    window.addEventListener("resize", apply);

    return () => {
      observer.disconnect();
      window.clearInterval(poll);
      window.removeEventListener("resize", apply);
    };
  }, []);
}
