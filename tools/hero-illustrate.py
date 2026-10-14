"""Ink-and-paint illustration of a real frame (the reference hero's look).

Three layers, bottom to top, inside the head (skin + hair) only:
  paper  white base
  paint  dry-brush strokes - teal / mustard / blush / coral - with bristle
         streaks, drying out toward the end of each stroke, paper grain
  ink    pure black from the frame's own darks: hair, brows, eyes, nostrils,
         mouth, jaw shadow - organic edges, specks removed
Clothes and wall stay photographic; a few dry strokes splash on the wall
behind the frame-left shoulder.

Every ink shape is a dark of the real frame, so identity and alignment are the
photograph's. The paint layout is seeded, so renders of different gazes differ
only around the eyes (checked by the caller).

usage: illustrate.py <frame.png> <person_mask.png> <out.png> [seed] [backdrop.png]

Ink and masks always come from <frame.png>; [backdrop.png] (the graded photo)
is what shows outside the illustrated head, so the seam matches the photo half.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import (
    binary_closing, binary_fill_holes, binary_opening, gaussian_filter, label,
)

frame_p, mask_p, out_p = sys.argv[1:4]
SEED = int(sys.argv[4]) if len(sys.argv) > 4 else 3
BACKDROP = sys.argv[5] if len(sys.argv) > 5 else frame_p

src = Image.open(frame_p).convert("RGB")
W, H = src.size
rgb_src = np.asarray(src, float)
person = np.asarray(Image.open(mask_p), float) / 255 > 0.5
hsv = np.asarray(src.convert("HSV"), float)
Hh, Ss, Vv = hsv[..., 0], hsv[..., 1], hsv[..., 2]
yy, xx = np.mgrid[0:H, 0:W]

INK_GLOBAL = 78
INK_LOCAL = 19
N_SWEEPS = 17
PAPER = np.array((240, 241, 238))
INK = np.array((8, 8, 10))
PALETTE = {
    "teal": ((147, 190, 192), 0.30),
    "mustard": ((226, 176, 85), 0.26),
    "blush": ((232, 185, 172), 0.28),
    "coral": ((201, 74, 63), 0.16),
}

# ---------------------------------------------------------------- head mask
skin = ((Hh < 28) | (Hh > 245)) & (Ss > 38) & (Vv > 70)
hair = (Vv < 85) & (yy < 520)
head = (skin | hair) & person
head = binary_closing(head, iterations=6)
head = binary_fill_holes(head)
head = binary_opening(head, iterations=3)
lab, n = label(head)
head = lab == (np.bincount(lab.ravel())[1:].argmax() + 1)
head &= person

# ---------------------------------------------------------------- ink
L = src.convert("L")
for _ in range(2):
    L = L.filter(ImageFilter.MedianFilter(5))
L = gaussian_filter(np.asarray(L, float), 1.2)
local = L - gaussian_filter(L, 22)
ink = (L < INK_GLOBAL) | ((local < -INK_LOCAL) & (L < 150))
ink &= head
# remove specks, close pinholes
lab, n = label(ink, structure=np.ones((3, 3)))
size = np.bincount(lab.ravel())
size[0] = 0
ink = size[lab] >= 90
holes = binary_fill_holes(ink) & ~ink
lab, n = label(holes)
hs = np.bincount(lab.ravel())
hs[0] = 0
ink |= holes & (hs[lab] < 25)
# organic, slightly bled edge
rng_ink = np.random.default_rng(SEED + 100)
edge_noise = gaussian_filter(rng_ink.standard_normal((H, W)), 1.2)
ink = gaussian_filter(ink.astype(float), 1.6) + edge_noise * 0.18 > 0.5
ink &= head

# ---------------------------------------------------------------- paint
rng = np.random.default_rng(SEED)
paint_rgb = np.zeros((H, W, 3))
paint_a = np.zeros((H, W))
grain = gaussian_filter(rng.standard_normal((H, W)), 0.8)


def stroke(p0, p1, half_w, color, dry=0.35, bend=0.0, opacity=0.93):
    p0, p1 = np.array(p0, float), np.array(p1, float)
    d = p1 - p0
    length = np.hypot(*d)
    u_hat = d / length
    v_hat = np.array([-u_hat[1], u_hat[0]])
    pad = half_w * 1.6 + abs(bend) + 4
    x0 = int(max(0, min(p0[0], p1[0]) - pad))
    x1 = int(min(W, max(p0[0], p1[0]) + pad))
    y0 = int(max(0, min(p0[1], p1[1]) - pad))
    y1 = int(min(H, max(p0[1], p1[1]) + pad))
    if x1 <= x0 or y1 <= y0:
        return
    X, Y = xx[y0:y1, x0:x1] - p0[0], yy[y0:y1, x0:x1] - p0[1]
    t = (X * u_hat[0] + Y * u_hat[1]) / length
    s = (X * v_hat[0] + Y * v_hat[1] - bend * 4 * (t - 0.5) ** 2) / half_w
    inside = (t > -0.02) & (t < 1.02)

    # bristles: a 1-D profile across the stroke, sampled by |s|
    nb = max(12, int(half_w * 1.4))
    prof = gaussian_filter(rng.random(nb), 1.4)
    prof = (prof - prof.min()) / (np.ptp(prof) + 1e-6)
    idx = np.clip(((s + 1) / 2 * (nb - 1)).astype(int), 0, nb - 1)
    bristle = prof[idx]

    ragged = gaussian_filter(rng.standard_normal(s.shape), 3) * 0.35
    body = np.abs(s) < 1 + ragged
    # dries out toward the end (and a little at the very start)
    dry_amt = np.clip((t - (1 - dry)) / dry, 0, 1) ** 1.3 + np.clip(0.06 - t, 0, 1) * 8
    g = grain[y0:y1, x0:x1]
    # solid body; bristle gaps open only toward the edges and the dry tail
    edge = np.clip((np.abs(s) - 0.55) / 0.45, 0, 1)
    cover = body & inside & (bristle + g * 0.15 > 0.04 + edge * 0.45 + dry_amt * 1.05)
    # paper speckle showing through
    cover &= g < 1.6

    shade = 0.93 + 0.12 * bristle[..., None]
    col = np.clip(np.array(color, float) * shade, 0, 255)
    a = cover * opacity
    region_a = paint_a[y0:y1, x0:x1]
    region_rgb = paint_rgb[y0:y1, x0:x1]
    region_rgb[:] = region_rgb * (1 - a[..., None]) + col * a[..., None]
    region_a[:] = region_a + a * (1 - region_a)


def pick():
    names = list(PALETTE)
    w = np.array([PALETTE[n][1] for n in names])
    return PALETTE[names[rng.choice(len(names), p=w / w.sum())]][0]


ys, xs = np.where(head)
cx, top, bot = xs.mean(), ys.min(), ys.max()
fw = xs.max() - xs.min()
face_top = top + (bot - top) * 0.22

# Big diagonal sweeps rising to frame-right, like the reference.
for _ in range(N_SWEEPS):
    ang = np.deg2rad(rng.uniform(-62, -30))
    ln = rng.uniform(0.55, 1.0) * fw
    c = np.array([cx + rng.normal(0, fw * 0.22), face_top + rng.uniform(0, 1) * (bot - face_top)])
    d = np.array([np.cos(ang), np.sin(ang)]) * ln / 2
    stroke(c - d, c + d, rng.uniform(38, 78), pick(), dry=rng.uniform(0.2, 0.4), bend=rng.normal(0, 18))
# A few near-vertical drags.
for _ in range(4):
    ang = np.deg2rad(rng.uniform(-100, -80))
    ln = rng.uniform(0.4, 0.7) * fw
    c = np.array([cx + rng.normal(0, fw * 0.25), face_top + rng.uniform(0.2, 0.9) * (bot - face_top)])
    d = np.array([np.cos(ang), np.sin(ang)]) * ln / 2
    stroke(c - d, c + d, rng.uniform(24, 44), pick(), dry=0.4)

# Speckle: small flicked drops, as on the reference's cheek and neck.
for _ in range(26):
    px = cx + rng.normal(0, fw * 0.3)
    py = face_top + rng.uniform(0.1, 1.05) * (bot - face_top)
    r = rng.uniform(2.5, 6.5)
    dot = (xx - px) ** 2 + (yy - py) ** 2 < r * r
    col = np.array(pick(), float)
    paint_rgb[dot] = col
    paint_a[dot] = 0.9

paint_in_head = paint_a * head

# Splashes on the wall behind the frame-left shoulder (never over the body).
splash_rgb, splash_a = paint_rgb.copy(), paint_a.copy()
paint_rgb[:] = 0
paint_a[:] = 0
# Anchor: just outside the frame-left shoulder line, so the strokes rise from
# behind it as in the reference.
pcols = np.where(person.any(0))[0]
shoulder_x = xs.min() - fw * 0.38
shoulder_y = np.argmax(person[:, int(shoulder_x)]) if person[:, int(shoulder_x)].any() else bot
sx, sy = shoulder_x - 30, shoulder_y - 40
for _ in range(7):
    ang = np.deg2rad(rng.uniform(-80, -55))
    ln = rng.uniform(120, 260)
    c = np.array([sx + rng.normal(0, 55), sy + rng.normal(0, 35)])
    d = np.array([np.cos(ang), np.sin(ang)]) * ln / 2
    stroke(c - d, c + d, rng.uniform(22, 42), pick(), dry=0.5, opacity=0.88)
wall_a = paint_a * (~person)
wall_rgb = paint_rgb.copy()

# ---------------------------------------------------------------- eyes
# The whites of the eyes stay paper, never paint: next to the black iris they
# are what makes the gaze direction read. Eye openings measured on frame 31.
EYE_OPENINGS = [(883, 359, 36, 12), (1037, 358, 35, 12)]
sclera = np.zeros((H, W), bool)
for ex, ey, rx, ry in EYE_OPENINGS:
    sclera |= ((xx - ex) / rx) ** 2 + ((yy - ey) / ry) ** 2 < 1
sclera &= (Ss < 80) & (Vv > 110) & ~ink
sclera = gaussian_filter(sclera.astype(float), 0.8) > 0.45
sclera &= ~ink

# ---------------------------------------------------------------- composite
out = np.asarray(Image.open(BACKDROP).convert("RGB"), float).copy()
# wall splashes
out = out * (1 - wall_a[..., None]) + wall_rgb * wall_a[..., None]
# head: paper -> paint -> ink
h = gaussian_filter(head.astype(float), 0.7)[..., None]
illu = np.empty_like(out)
illu[:] = PAPER
pa = paint_in_head[..., None]
illu = illu * (1 - pa) + splash_rgb * pa
illu[sclera] = PAPER
illu[ink] = INK
out = out * (1 - h) + illu * h
Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(out_p)
np.save(out_p + ".head.npy", head)
print("saved", out_p)
