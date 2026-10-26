#!/usr/bin/env python3
"""index.html = src.html with the carousel slides (slides/sN.webp, 720px) inlined as data URIs."""
import base64
from pathlib import Path

ROOT = Path(__file__).parent
ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11 5 5 11M5 5.5V11h5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
page = (ROOT / "src.html").read_text(encoding="utf-8").replace("{{ARROW}}", ARROW)
for i in range(10, 0, -1):
    uri = "data:image/webp;base64," + base64.b64encode((ROOT / f"slides/s{i}.webp").read_bytes()).decode()
    page = page.replace("{{S%d}}" % i, uri)
assert "{{" not in page
(ROOT / "index.html").write_text(page, encoding="utf-8")
print(f"index.html written: {len(page) / 1e6:.2f} MB")
