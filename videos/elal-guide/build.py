#!/usr/bin/env python3
"""index.html = src.html + clips/pN.webp inlined as data URIs + the public skill (skill/) as a one-paste install prompt."""
import base64, html
from pathlib import Path

ROOT = Path(__file__).parent
page = (ROOT / "src.html").read_text(encoding="utf-8")
for i in range(11, 0, -1):
    uri = "data:image/webp;base64," + base64.b64encode((ROOT / f"clips/p{i}.webp").read_bytes()).decode()
    page = page.replace("{{P%d}}" % i, uri)
skill = (ROOT / "skill/SKILL.md").read_text(encoding="utf-8").rstrip()
crop = (ROOT / "skill/scripts/crop.py").read_text(encoding="utf-8").rstrip()
install = (
    "Create a Claude Code skill named app-spec-ad. Write these two files exactly as given "
    "(create the folders if needed), make crop.py executable, then tell me the skill is installed "
    "and how to use it.\n\n"
    "=== FILE: ~/.claude/skills/app-spec-ad/SKILL.md ===\n" + skill + "\n=== END FILE ===\n\n"
    "=== FILE: ~/.claude/skills/app-spec-ad/scripts/crop.py ===\n" + crop + "\n=== END FILE ==="
)
page = page.replace("{{INSTALL}}", html.escape(install, quote=False))
assert "{{" not in page.replace("{{first_name}}", "")
(ROOT / "index.html").write_text(page, encoding="utf-8")
print(f"index.html written: {len(page) / 1e6:.2f} MB")
