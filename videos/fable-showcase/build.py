#!/usr/bin/env python3
"""index.html = src.html with the voice envelope (data/audio.json) and the voice clip timing filled in."""
from pathlib import Path
R = Path(__file__).parent
s = (R / "src.html").read_text(encoding="utf-8")
s = s.replace("__AUDIO__", (R / "data/audio.json").read_text()).replace("__VO_START__", "5").replace("__VO_DUR__", "0.9")
assert "__" not in s.split("<script type=\"module\">")[0].replace("__hf", "")
(R / "index.html").write_text(s, encoding="utf-8"); print("index.html written")
