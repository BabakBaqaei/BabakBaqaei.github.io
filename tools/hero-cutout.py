"""Cut the hero person out of the grey studio wall, for a white page.

  alpha   rembg isnet mask of frame 31 (254 inside the body -> 250+ is opaque)
  colour  decontaminated: edge pixels mix the person with the grey wall, so the
          wall's share is subtracted, F = (I - (1-a) B) / a, with B the wall
          estimated by a normalised blur of the pixels outside the mask.
          Without it, a grey fringe rings the person on white.
  grade   hero-grade.py applied to F (never to the wall).

Outputs RGBA WebP: photo (graded cut-out), fantasy (illustrated head + graded
cut-out body + wall paint as its own alpha), and the photo eye sprite.

usage: cutout.py <out_dir>
"""
import sys, subprocess, os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

OUT = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
SAT, WARM, BLACK, WHITE, GAMMA = 0.40, np.array([1, 1, -7.0]), 52.0, 224.0, 0.96
EYES = (840, 308, 1096, 404)
LUMA = np.array([0.299, 0.587, 0.114])


def grade(a):
    Y = (a @ LUMA)[..., None]
    b = Y + (a - Y) * SAT + WARM
    Yb = (b @ LUMA)[..., None]
    Yn = np.clip((Yb - BLACK) / (WHITE - BLACK), 0, 1) ** GAMMA * 255
    return (b + (Yn - Yb)).clip(0, 255)


m = np.asarray(Image.open(f"{HERE}/src/f031_mask.png"), float)
alpha = np.clip(m / 250.0, 0, 1)
outside = (m == 0).astype(float)


def decontaminate(img):
    num = gaussian_filter(img * outside[..., None], (40, 40, 0))
    den = gaussian_filter(outside, 40)[..., None]
    wall = num / np.maximum(den, 1e-3)
    a = alpha[..., None]
    F = (img - (1 - a) * wall) / np.maximum(a, 0.04)
    return np.where(a > 0.02, F, img).clip(0, 255)


def rgba(rgb, a):
    return Image.fromarray(np.dstack([rgb.round(), (a * 255).round()]).clip(0, 255).astype(np.uint8), "RGBA")


load = lambda p: np.asarray(Image.open(p).convert("RGB"), float)

# --- photo -------------------------------------------------------------------
F = decontaminate(load(f"{HERE}/src/f031.png"))
G = grade(F)
rgba(G, alpha).save(f"{OUT}/photo.webp", "WEBP", quality=90, method=6, exact=True)
Image.fromarray(G.round().astype(np.uint8)).save(f"{HERE}/graded_cutout.png")

# photo eye sprite: same strip of every graded gaze step (fully inside the face)
sheet = Image.new("RGB", (EYES[2] - EYES[0], (EYES[3] - EYES[1]) * 9))
frames = [f"{HERE}/src/f031.png"] + [f"{HERE}/steps/g_r{d}.png" for d in range(1, 9)]
for k, f in enumerate(frames):
    strip = Image.fromarray(grade(load(f)).round().astype(np.uint8)).crop(EYES)
    sheet.paste(strip, (0, k * (EYES[3] - EYES[1])))
sheet.save(f"{OUT}/photo-eyes.webp", "WEBP", quality=92, method=6)

# --- fantasy -----------------------------------------------------------------
il = f"{HERE}/il_lens_cut.png"
subprocess.run([sys.executable, f"{HERE}/illustrate.py", f"{HERE}/src/f031.png",
                f"{HERE}/src/f031_mask.png", il, "9", f"{HERE}/graded_cutout.png"], check=True)
L = np.load(il + ".layers.npz")
h, wa, wrgb = L["head_h"], L["wall_a"], L["wall_rgb"]
ill = load(il)
fa = np.maximum.reduce([alpha, h, wa])
# Around the illustrated head the photo's soft hair edge would show as grey
# wisps outside the ink outline; there the head's own coverage is the alpha.
near_head = gaussian_filter((h > 0.5).astype(float), 10) > 0.01
fa = np.where(near_head & (alpha < 0.98), np.maximum(h, wa), fa)
# Wall paint carries its own alpha and pure paint colour (un-premultiplied).
paint_only = (wa > 0) & (alpha < 0.02) & (h < 0.02)
rgb = ill.copy()
rgb[paint_only] = wrgb[paint_only]
rgba(rgb, fa).save(f"{OUT}/fantasy.webp", "WEBP", quality=90, method=6, exact=True)
for f in ("photo.webp", "fantasy.webp", "photo-eyes.webp"):
    print(f, os.path.getsize(f"{OUT}/{f}") // 1024, "KB")
