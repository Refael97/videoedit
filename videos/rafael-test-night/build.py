"""build index.html from src/template.html: inlines the word timings (data/words.json) as WORDS and
expands the SFX cue list (src/sfx.txt: "<time> <name> [volume]") into <audio> tags on free tracks."""
import json, pathlib, wave
root = pathlib.Path(__file__).parent
words = json.loads((root / "data/words.json").read_text())
sfx_dir = root / "assets/theme/sfx"
dur = {p.stem: (lambda w: w.getnframes() / w.getframerate())(wave.open(str(p))) for p in sfx_dir.glob("*.wav")}
tags, ends = [], {}
for i, line in enumerate(l for l in (root / "src/sfx.txt").read_text().splitlines() if l.strip() and not l.startswith("#")):
    t, name, *v = line.split()
    t, d = float(t), round(dur[name], 3)
    track = next(k for k in range(11, 40) if ends.get(k, -1) <= t)
    ends[track] = t + d + 0.01
    tags.append(f'      <audio id="sfx{i}" src="assets/theme/sfx/{name}.wav" data-start="{t}" data-duration="{d}" data-track-index="{track}" data-volume="{v[0] if v else 0.3}"></audio>')
html = (root / "src/template.html").read_text().replace("__WORDS__", json.dumps(words, ensure_ascii=False)).replace("<!--__SFX__-->", "\n".join(tags))
(root / "index.html").write_text(html)
print("index.html built,", len(words), "words,", len(tags), "sfx")
