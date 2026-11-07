"""build index.html from src/template.html: inlines the word timings (data/words.json) as WORDS."""
import json, pathlib
root = pathlib.Path(__file__).parent
words = json.loads((root / "data/words.json").read_text())
html = (root / "src/template.html").read_text().replace("__WORDS__", json.dumps(words, ensure_ascii=False))
(root / "index.html").write_text(html)
print("index.html built,", len(words), "words")
