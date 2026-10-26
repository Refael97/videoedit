#!/usr/bin/env python3
"""index.html = src.html with the clips/pN.webp previews (cut from the Bit render) inlined as data URIs."""
import base64
from pathlib import Path

ROOT = Path(__file__).parent
page = (ROOT / "src.html").read_text(encoding="utf-8")
for i in range(11, 0, -1):
    uri = "data:image/webp;base64," + base64.b64encode((ROOT / f"clips/p{i}.webp").read_bytes()).decode()
    page = page.replace("{{P%d}}" % i, uri)
assert "{{" not in page
(ROOT / "index.html").write_text(page, encoding="utf-8")
print(f"index.html written: {len(page) / 1e6:.1f} MB")
