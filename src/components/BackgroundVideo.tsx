import { useEffect, useRef } from "react";

const VIDEO_SRC = "/video/hero.mp4";

/**
 * Time marks inside `hero.mp4`, which is now trimmed to exactly the usable
 * sweep — so the clip starts fully turned to frame-left and ends fully turned
 * to frame-right, with nothing to skip past.
 *
 * The window was measured off the original six-second take: yaw was sampled
 * every 0.15s by comparing the horizontal centroid of skin-tone pixels against
 * the centroid of hair pixels — the face sits left of the hair mass when the
 * head turns toward frame-left, and right of it when it turns the other way.
 * The reading swept cleanly through zero at 2.35 / 3.55 / 4.45s, and the file
 * was cut on those marks (the untrimmed original is kept in unused-media/).
 *
 * The clip is also encoded with every frame a keyframe. Scrubbing a normal
 * long-GOP file means decoding forward from the previous keyframe on every
 * mouse move, which is exactly the lag that showed up as the head trailing the
 * cursor; all-intra makes a seek a single-frame decode.
 */
const TURN_LEFT = 0;
const TURN_CENTER = 1.2;
const TURN_RIGHT = 2.1;

/** Ignore sub-frame differences so we never queue a pointless seek. */
const EPSILON = 0.01;

/** Cursor position (0..1) to clip time, with screen centre pinned to camera-facing. */
function timeForCursor(fraction: number): number {
  const x = Math.min(Math.max(fraction, 0), 1);
  return x < 0.5
    ? TURN_LEFT + (TURN_CENTER - TURN_LEFT) * (x / 0.5)
    : TURN_CENTER + (TURN_RIGHT - TURN_CENTER) * ((x - 0.5) / 0.5);
}

/**
 * Backdrop clip that never autoplays — the head tracks the cursor.
 *
 * Absolutely positioned inside the hero section, not fixed to the viewport:
 * the page scrolls now, and a fixed clip would sit behind every section below.
 *
 * Time comes from the cursor's absolute X rather than accumulated deltas, so the
 * head *points* where the mouse is instead of drifting out of sync. The two
 * halves of the screen are mapped separately so dead centre is always the
 * camera-facing frame, even though it does not sit exactly midway between the
 * two turn extremes.
 */
export function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTime = useRef(TURN_CENTER);
  const isSeeking = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    /**
     * Seeks toward the current target. If a seek is already in flight the
     * request is dropped: `seeked` re-runs this, so the newest target always
     * wins and the element is never flooded with `currentTime` writes.
     */
    const seek = () => {
      if (isSeeking.current) return;
      const target = targetTime.current;
      if (Math.abs(video.currentTime - target) < EPSILON) return;
      isSeeking.current = true;
      video.currentTime = target;
    };

    const handleSeeked = () => {
      isSeeking.current = false;
      seek();
    };

    // Rest on the camera-facing frame until the cursor says otherwise.
    const handleLoaded = () => seek();

    const handleMouseMove = (event: MouseEvent) => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      targetTime.current = timeForCursor(event.clientX / window.innerWidth);
      seek();
    };

    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("loadeddata", handleLoaded);
    window.addEventListener("mousemove", handleMouseMove);
    if (video.readyState >= 2) handleLoaded();

    return () => {
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("loadeddata", handleLoaded);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={VIDEO_SRC}
      muted
      playsInline
      preload="auto"
      aria-hidden
      className="absolute inset-0 z-0 h-full w-full object-cover"
      style={{ objectPosition: "50% center" }}
    />
  );
}
