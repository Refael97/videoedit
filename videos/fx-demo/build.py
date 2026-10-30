"""build <theme>/index.html from <theme>/src/template.html: inlines WORDS, FACE_DATA (face track), FACTS (facts.yaml)
and expands src/sfx.txt into <audio> tags.   usage: python3 build.py paper|night"""
import json, pathlib, sys, wave, yaml
root = pathlib.Path(__file__).parent / sys.argv[1]
words = json.loads((root / "data/words.json").read_text())
face = json.loads((root / "data/face.json").read_text())
facts = yaml.safe_load((root / "data/facts.yaml").read_text())
sfx = root / "assets/theme/sfx"
dur = {p.stem: (lambda w: w.getnframes() / w.getframerate())(wave.open(str(p))) for p in sfx.glob("*.wav")}
tags, ends = [], {}
for i, line in enumerate(l for l in (root / "src/sfx.txt").read_text().splitlines() if l.strip() and not l.startswith("#")):
    t, name, *v = line.split(); t, d = float(t), round(dur[name], 3)
    tr = next(k for k in range(11, 40) if ends.get(k, -1) <= t); ends[tr] = t + d + 0.01
    tags.append(f'      <audio id="sfx{i}" src="assets/theme/sfx/{name}.wav" data-start="{t}" data-duration="{d}" data-track-index="{tr}" data-volume="{v[0] if v else 0.3}"></audio>')
html = (root / "src/template.html").read_text().replace("__WORDS__", json.dumps(words, ensure_ascii=False)) \
    .replace("__FACE__", json.dumps(face)).replace("__FACTS__", json.dumps(facts, ensure_ascii=False)).replace("<!--__SFX__-->", "\n".join(tags))
(root / "index.html").write_text(html)
print(root.name, "built:", len(words), "words,", len(face["boxes"]), "face boxes,", len(tags), "sfx")
