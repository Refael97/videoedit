"""Traces the current Isrotel logo (navy wordmark + Hebrew name on white, a PNG from the user) into SVG paths,
one path per letter, so the film can draw its outline and then fill it. Writes assets/img/logo_paths.json.
Run from the project root: python3 tools/trace_logo.py"""
import json
import cv2
import numpy as np
from PIL import Image

S = 8  # supersample before tracing so the curves come out smooth
im = Image.open("assets/img/logo_navy.png").convert("RGB")
W, H = im.size
big = im.resize((W * S, H * S), Image.LANCZOS)
a = np.array(big).astype(np.int32)
ink = (a[:, :, 2] - a[:, :, 0] > 40) & (a[:, :, 0] < 170)          # navy pixels
m = (ink * 255).astype(np.uint8)
m = cv2.GaussianBlur(m, (0, 0), S * 0.6); _, m = cv2.threshold(m, 127, 255, cv2.THRESH_BINARY)
cnts, hier = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
hier = hier[0]

def path(c):
    c = cv2.approxPolyDP(c, S * 0.22, True)[:, 0, :] / S
    return "M" + " L".join("%.2f %.2f" % (x, y) for x, y in c) + "Z"

letters = []
for i, c in enumerate(cnts):
    if hier[i][3] != -1 or cv2.contourArea(c) < (S * 3) ** 2: continue          # outer contours only
    d = path(c); k = hier[i][2]
    while k != -1:
        if cv2.contourArea(cnts[k]) > (S * 2) ** 2: d += " " + path(cnts[k])
        k = hier[k][0]
    x, y, w, h = cv2.boundingRect(c)
    letters.append({"d": d, "x": x / S, "y": y / S, "w": w / S, "h": h / S})
# the Latin word is the top row (left to right), the Hebrew word the bottom row (right to left)
mid = sum(l["y"] + l["h"] / 2 for l in letters) / len(letters)
top = sorted([l for l in letters if l["y"] + l["h"] / 2 < mid], key=lambda l: l["x"])
bot = sorted([l for l in letters if l["y"] + l["h"] / 2 >= mid], key=lambda l: -l["x"])
x0 = min(l["x"] for l in letters); y0 = min(l["y"] for l in letters); x1 = max(l["x"] + l["w"] for l in letters); y1 = max(l["y"] + l["h"] for l in letters)
json.dump({"box": [x0, y0, x1 - x0, y1 - y0], "top": top, "bot": bot}, open("assets/img/logo_paths.json", "w"))
open("assets/img/logo_paths.js", "w").write("window.LOGO = " + json.dumps({"box": [x0, y0, x1 - x0, y1 - y0], "top": [l["d"] for l in top], "bot": [l["d"] for l in bot]}) + ";\n")
print("letters:", len(top), "+", len(bot), "box", [round(v, 1) for v in (x0, y0, x1 - x0, y1 - y0)])
svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="%.1f %.1f %.1f %.1f"><g fill="#002d74" fill-rule="evenodd">%s</g></svg>' % (x0 - 6, y0 - 6, x1 - x0 + 12, y1 - y0 + 12, "".join('<path d="%s"/>' % l["d"] for l in top + bot))
open("assets/img/logo_traced.svg", "w").write(svg)
