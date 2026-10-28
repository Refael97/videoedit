# builds index.html with the per-frame voice analysis inlined (run analyze.py first)
s = open("source/src.html").read().replace("__AUDIO__", open("data/audio.json").read())
open("index.html", "w").write(s)
