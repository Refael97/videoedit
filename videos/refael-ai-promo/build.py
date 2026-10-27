# inline the 3D font into the composition
s = open("source/src.html").read()
open("index.html", "w").write(s.replace("__FONT__", open("assets/rubik900.json").read()))
