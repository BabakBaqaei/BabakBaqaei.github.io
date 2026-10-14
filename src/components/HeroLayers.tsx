import { useEffect, useRef, type Ref } from "react";
import { FADE_AT } from "@/hooks/useCursorSplit";
import { HeroDecor } from "@/components/HeroDecor";

/**
 * The split portrait: one head that never moves, illustration on the left of
 * a vertical seam and photograph on the right. The cursor slides the seam
 * across the face — toward the right and the photograph takes the face over,
 * toward the left and the illustration does — and the eyes on each side turn
 * to follow it.
 *
 * Both halves come from one sharp, camera-facing frame (1.25s of the take):
 *
 *   photo.webp     the frame itself
 *   fantasy.webp   the same frame as ink + dry-brush paint
 *                  (`tools/hero-illustrate.py`), every shape a dark of the photo
 *   *-eyes.webp    9-step sprites of just the eye strip, gaze 0..8px toward the
 *                  side that is winning. Made by sliding the real iris inside its
 *                  own eye opening (`tools/hero-gaze.py`) — every real
 *                  sideways-gaze frame in the take is motion-blurred.
 *
 * Because everything is the one frame, nothing but the eyes ever changes under
 * the seam: the head, hair, suit and wall line up to the pixel.
 *
 * The box below is sized like `object-fit: cover`, so every position here is a
 * fraction of the 1920x1080 source and the landmarks in `labels.ts` still hold.
 */
const PHOTO_SRC = "/images/hero/photo.webp";
const FANTASY_SRC = "/images/hero/fantasy.webp";
const PHOTO_EYES = "/images/hero/photo-eyes.webp";
const FANTASY_EYES = "/images/hero/fantasy-eyes.webp";

const SRC_W = 1920;
const SRC_H = 1080;
/** The eye strip the sprites replace: every gaze step differs only inside it. */
const EYES = { x: 840, y: 308, w: 256, h: 96 };
const GAZE_STEPS = 8;
/** Seam travel (0..1 of full reveal) by which the eyes have fully turned. */
const GAZE_FULL_AT = 0.55;

/**
 * Seam position in source x against reveal. Measured on the frame: the head
 * spans x 0.382-0.613 and the illustration (with its wall splashes) differs
 * from the photo only within x 0.209-0.614. So the seam spends almost all of
 * the cursor's travel crossing the face, then clears the splashes at the end.
 */
const TOWARD_PHOTO: ReadonlyArray<readonly [number, number]> = [
  [0, 0.5],
  [0.88, 0.375],
  [1, 0.2],
];
const TOWARD_FANTASY: ReadonlyArray<readonly [number, number]> = [
  [0, 0.5],
  [0.92, 0.62],
  [1, 0.62],
];

/**
 * Sideways drift toward the cursor at full reveal, as a fraction of the
 * viewport width. Measured on the reference: the person travels ~95 CSS px
 * end to end on a 1440px screen, i.e. +-3.3%. The scenery behind drifts less,
 * which is what makes it read as depth.
 */
const SWAY_PERSON = 0.033;
/** ~3 source px: enough to cover the antialiased edge of the illustration's clip. */
const SEAM_OVERLAP = 0.0015;
const SWAY_DECOR = 0.012;

/** How far the seam lags the cursor: a soft follow, not a jump. */
const TAU_MS = 140;

function along(stops: ReadonlyArray<readonly [number, number]>, p: number) {
  for (let i = 1; i < stops.length; i++) {
    const [p1, x1] = stops[i];
    if (p <= p1) {
      const [p0, x0] = stops[i - 1];
      return x0 + ((x1 - x0) * (p - p0)) / (p1 - p0);
    }
  }
  return stops[stops.length - 1][1];
}

/** Cursor fraction (0..1) to signed reveal: -1 all illustration, +1 all photo. */
function revealFor(fraction: number) {
  return Math.max(-1, Math.min(1, (fraction - 0.5) / (FADE_AT - 0.5)));
}

function gazeStep(amount: number) {
  return Math.round(
    Math.min(1, Math.max(0, amount) / GAZE_FULL_AT) * GAZE_STEPS,
  );
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

function EyeStrip({
  src,
  stepRef,
}: {
  src: string;
  stepRef: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={stepRef}
      aria-hidden
      className="absolute"
      style={{
        left: pct(EYES.x, SRC_W),
        top: pct(EYES.y, SRC_H),
        width: pct(EYES.w, SRC_W),
        height: pct(EYES.h, SRC_H),
        backgroundImage: `url(${src})`,
        backgroundSize: `100% ${(GAZE_STEPS + 1) * 100}%`,
        backgroundPositionY: "0%",
      }}
    />
  );
}

export function HeroLayers() {
  const fantasyRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const personRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);
  const photoEyesRef = useRef<HTMLDivElement>(null);
  const fantasyEyesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fantasy = fantasyRef.current;
    const photoEyes = photoEyesRef.current;
    const fantasyEyes = fantasyEyesRef.current;
    const photo = photoRef.current;
    const person = personRef.current;
    const decor = decorRef.current;
    if (!fantasy || !photoEyes || !fantasyEyes || !photo || !person || !decor)
      return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let target = 0;
    let current = 0;
    let last = 0;
    let frame = 0;
    let shownPhoto = -1;
    let shownFantasy = -1;

    const paint = (p: number) => {
      const seam = p >= 0 ? along(TOWARD_PHOTO, p) : along(TOWARD_FANTASY, -p);
      // The illustration is the top layer; everything right of the seam is cut away.
      fantasy.style.clipPath = `inset(0 ${((1 - seam) * 100).toFixed(3)}% 0 0)`;
      // Both layers are cut-outs now, so each is confined to its own side:
      // otherwise the photo's soft hair edge shows through beside the ink.
      // The photo reaches SEAM_OVERLAP under the illustration: two clips that
      // meet on a fractional pixel are each half-transparent there, and the
      // white page showed through as a hairline down the tie and the suit.
      photo.style.clipPath = `inset(0 0 0 ${((seam - SEAM_OVERLAP) * 100).toFixed(3)}%)`;

      const vw = window.innerWidth;
      person.style.transform = `translateX(${(p * SWAY_PERSON * vw).toFixed(2)}px)`;
      decor.style.transform = `translateX(${(p * SWAY_DECOR * vw).toFixed(2)}px)`;

      // Sprite rows are written only when the step changes.
      const ps = gazeStep(p);
      if (ps !== shownPhoto) {
        shownPhoto = ps;
        photoEyes.style.backgroundPositionY = `${(ps / GAZE_STEPS) * 100}%`;
      }
      const fs = gazeStep(-p);
      if (fs !== shownFantasy) {
        shownFantasy = fs;
        fantasyEyes.style.backgroundPositionY = `${(fs / GAZE_STEPS) * 100}%`;
      }
    };

    const tick = (now: number) => {
      const dt = last ? now - last : 16;
      last = now;
      current += (target - current) * (1 - Math.exp(-dt / TAU_MS));
      if (Math.abs(target - current) < 0.0005) current = target;
      paint(current);
      if (current === target) {
        frame = 0;
        last = 0;
      } else {
        frame = requestAnimationFrame(tick);
      }
    };

    const onMove = (event: MouseEvent) => {
      target = revealFor(event.clientX / window.innerWidth);
      if (reduced.matches) {
        current = target;
        paint(current);
        return;
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };

    // Warm the sprites so the first glance does not wait on a fetch.
    for (const src of [PHOTO_EYES, FANTASY_EYES]) new Image().src = src;

    paint(0);
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  const fill = "absolute inset-0 h-full w-full select-none";

  return (
    <div
      className="absolute left-1/2 top-1/2 z-0 aspect-video -translate-x-1/2 -translate-y-1/2"
      style={{ width: "max(100%, calc(var(--app-vh) * 16 / 9))" }}
    >
      {/* Scenery: behind the person, drifting less than they do. */}
      <div
        ref={decorRef}
        // On phones the cover crop shows only the face; the scenery would
        // poke in at the edges as stray fragments, so it is not drawn there.
        className="absolute inset-0 max-md:hidden"
        style={{ willChange: "transform" }}
      >
        <HeroDecor />
      </div>

      <div
        ref={personRef}
        className="absolute inset-0"
        style={{ willChange: "transform" }}
      >
        {/* Photograph: right of the seam. */}
        <div
          ref={photoRef}
          className="absolute inset-0"
          style={{ clipPath: "inset(0 0 0 49.85%)", willChange: "clip-path" }}
        >
          <img
            src={PHOTO_SRC}
            alt="Babak Baghaei, half photograph and half illustration"
            width={SRC_W}
            height={SRC_H}
            fetchPriority="high"
            draggable={false}
            className={fill}
          />
          <EyeStrip src={PHOTO_EYES} stepRef={photoEyesRef} />
        </div>

        {/* Illustration: on top, cut at the seam. The inline clip is the resting
          state (seam on the nose line), so the split holds without any script. */}
        <div
          ref={fantasyRef}
          aria-hidden
          className="absolute inset-0"
          style={{ clipPath: "inset(0 50% 0 0)", willChange: "clip-path" }}
        >
          <img
            src={FANTASY_SRC}
            alt=""
            width={SRC_W}
            height={SRC_H}
            fetchPriority="high"
            draggable={false}
            className={fill}
          />
          <EyeStrip src={FANTASY_EYES} stepRef={fantasyEyesRef} />
        </div>
      </div>
    </div>
  );
}
