"""Redirect the gaze of a sharp, camera-facing frame by moving the real iris.

Every sideways-gaze frame in the take is motion-blurred (eye-region Laplacian
variance 45-90 against 633 here), so the eyes are not borrowed from another
frame. Instead the iris is slid sideways inside its own eye opening with a 1-D
horizontal warp, like a Liquify push: constant over the iris (it moves intact),
tapering linearly to zero at the eye corners (the sclera stretches on one side
and compresses on the other), and fading out above and below the opening so the
lids and brows do not move. The head is pixel-identical across all gazes.

usage: gaze.py <frame.png> <out.png> <dx px; + = frame-right>
"""
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates

src, out, dx = sys.argv[1], sys.argv[2], float(sys.argv[3])
img = np.asarray(Image.open(src).convert("RGB"), float)
H, W, _ = img.shape

# Measured off 6x gridded crops of frame 31 (1920x1080).
#   corners: outer/inner x of the opening; iris: left/right x; y: opening band
EYES = [
    dict(c0=846, c1=918, i0=869, i1=896, y0=348, y1=369),   # frame-left eye
    dict(c0=1004, c1=1068, i0=1023, i1=1049, y0=348, y1=368),  # frame-right eye
]
FADE_Y = 4

yy, xx = np.mgrid[0:H, 0:W].astype(float)
disp = np.zeros((H, W))
for e in EYES:
    # Output-space x where the shifted iris sits, with a 1px guard.
    a = (e["i0"] + dx) - 1 if dx > 0 else e["i0"] + dx - 1
    b = (e["i1"] + dx) + 1 if dx > 0 else e["i1"] + dx + 1
    c0, c1 = e["c0"], e["c1"]
    assert a - c0 > abs(dx) and c1 - b > abs(dx), "taper too short: warp would fold"
    wx = np.zeros(W)
    xs = np.arange(W, dtype=float)
    wx = np.where((xs >= c0) & (xs < a), (xs - c0) / (a - c0), wx)
    wx = np.where((xs >= a) & (xs <= b), 1.0, wx)
    wx = np.where((xs > b) & (xs <= c1), (c1 - xs) / (c1 - b), wx)
    ys = np.arange(H, dtype=float)
    wy = np.clip(np.minimum(ys - (e["y0"] - FADE_Y), (e["y1"] + FADE_Y) - ys) / FADE_Y, 0, 1)
    disp = np.maximum(disp, np.outer(wy, wx))

# new(x) = old(x - dx * w(x)): pulls the iris from its original place.
sx = xx - dx * disp
outimg = np.stack(
    [map_coordinates(img[..., c], [yy, sx], order=3, mode="nearest") for c in range(3)],
    axis=-1,
)
# Outside the warp the frame must stay bit-identical (the spline would round a
# few pixels by 1, enough to flip thresholds in the illustration downstream).
moved = disp > 0
final = img.copy()
final[moved] = outimg[moved]
Image.fromarray(final.clip(0, 255).round().astype(np.uint8)).save(out)
print("saved", out)
