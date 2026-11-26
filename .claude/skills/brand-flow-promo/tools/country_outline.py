"""Country outline as an SVG path + pin positions, for the 3D map slab.
Usage: python3 tools/country_outline.py <out.js> <iso-numeric-id>[,<id>...] <name:lon:lat> [<name:lon:lat> ...]
Example (Israel as one shape, six pins): python3 tools/country_outline.py assets/img/map_paths.js 376,275 ramon:34.80:30.61 eilat:34.95:29.56
Writes window.MAP = {w, h, d, pins}. Data: Natural Earth 1:10m via world-atlas on jsDelivr (say which borders the shape includes when you report)."""
import json, math, sys, urllib.request
out, ids, pins = sys.argv[1], sys.argv[2].split(","), [a.split(":") for a in sys.argv[3:]]
t = json.load(urllib.request.urlopen("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json"))
sc, tr = t["transform"]["scale"], t["transform"]["translate"]
def arc(i):
    a = t["arcs"][i if i >= 0 else ~i]; x = y = 0; pts = []
    for dx, dy in a: x += dx; y += dy; pts.append((x * sc[0] + tr[0], y * sc[1] + tr[1]))
    return pts if i >= 0 else pts[::-1]
def ring(r):
    o = []
    for i in r: p = arc(i); o += p if not o else p[1:]
    return o
polys = []
for g in t["objects"]["countries"]["geometries"]:
    if g.get("id") in ids:
        for p in (g["arcs"] if g["type"] == "MultiPolygon" else [g["arcs"]]): polys.append(ring(p[0]))
xs = [x for r in polys for x, _ in r]; ys = [y for r in polys for _, y in r]
lon0, lon1, lat0, lat1 = min(xs) - 0.05, max(xs) + 0.05, min(ys) - 0.05, max(ys) + 0.05
C = math.cos(math.radians((lat0 + lat1) / 2)); K = 1640 / (lat1 - lat0) if (lat1 - lat0) > (lon1 - lon0) * C else 1640 / ((lon1 - lon0) * C)
P = lambda lon, lat: ((lon - lon0) * K * C, (lat1 - lat) * K)
d = "".join("M" + "L".join("%.1f,%.1f" % P(x, y) for x, y in r) + "Z" for r in polys)
res = {"w": round((lon1 - lon0) * K * C), "h": round((lat1 - lat0) * K), "d": d, "pins": {n: [round(v, 1) for v in P(float(lo), float(la))] for n, lo, la in pins}}
open(out, "w").write("window.MAP = " + json.dumps(res) + ";\n"); print(res["w"], res["h"], res["pins"])
