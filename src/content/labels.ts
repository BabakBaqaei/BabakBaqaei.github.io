export const LEFT_LABEL = "coder & trader";
export const RIGHT_LABEL = "hotel manager";

/**
 * Landmarks measured off `public/video/hero.mp4`, normalised to the source
 * frame (1920x1080). Taken from the footage rather than eyeballed:
 *
 * - EYE_Y      pupils sit on this line (verified against a drawn guide)
 * - HEAD_LEFT  \ widest horizontal extent of the head **within the eye band**,
 * - HEAD_RIGHT / unioned across the turn poses at t = 2.35 / 2.95 / 3.55 / 4.0 / 4.45
 *
 * Re-measure these if the clip is ever replaced.
 */
export const VIDEO_W = 1920;
export const VIDEO_H = 1080;
export const EYE_Y = 0.34;
export const HEAD_LEFT = 0.344;
export const HEAD_RIGHT = 0.623;

/** Breathing room between a label and the head, and between a label and the edge. */
export const EDGE_PAD = 40;
export const FACE_GAP = 36;

export const LABEL_MIN = 13;
export const LABEL_MAX = 52;
