#!/usr/bin/env python3
"""index.html = src/template.html + word/segment timings of the placed narration.

Run: python3 tools/make_vo.py (once per take), then python3 build.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).parent
words = json.loads((ROOT / "data/words.json").read_text(encoding="utf-8"))["words"]
segs = json.loads((ROOT / "data/segments.json").read_text(encoding="utf-8"))
DURATION = 55.5

page = (ROOT / "src/template.html").read_text(encoding="utf-8")
page = (page.replace("{{WD}}", json.dumps([w["start"] for w in words]))
        .replace("{{SG}}", json.dumps({k: v["start"] for k, v in segs.items()}))
        .replace("{{DURATION}}", f"{DURATION}"))
assert "{{" not in page
(ROOT / "index.html").write_text(page, encoding="utf-8")
print("index.html written:", len(page), "bytes")
