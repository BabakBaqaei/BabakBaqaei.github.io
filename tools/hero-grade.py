"""Photo grade matched to the reference's real half: muted, warm, inky.

Measured on the reference's photo (cheek/forehead, then the whole frame):
skin saturation median 40 (ours 75), skin mean RGB 185/170/155 (ours
193/153/137, pinker), luminance p5/p50/p95 = 1/167/207 (ours 59/170/196 - our
darks never reach black). Three steps, each derived from those numbers:

  1. desaturate toward luminance by SAT
  2. rebalance chroma so the skin's mean colour lands on the reference's
     warm, sepia-leaning neutral
  3. levels: black point so the darks go to ink, white point for the light end

usage: grade.py <in.png> <out.png>
"""
import sys
import numpy as np
from PIL import Image

SAT = 0.40
WARM = np.array([1, 1, -7], float)
BLACK, WHITE, GAMMA = 52.0, 224.0, 0.96

src, out = sys.argv[1], sys.argv[2]
a = np.asarray(Image.open(src).convert("RGB"), float)
Y = (a @ np.array([0.299, 0.587, 0.114]))[..., None]
c = (a - Y) * SAT
b = Y + c + WARM
# levels on luminance only, so the colour ratios survive
Yb = (b @ np.array([0.299, 0.587, 0.114]))[..., None]
Yn = np.clip((Yb - BLACK) / (WHITE - BLACK), 0, 1) ** GAMMA * 255
res = b + (Yn - Yb)
Image.fromarray(res.clip(0, 255).round().astype(np.uint8)).save(out)
print("saved", out)
