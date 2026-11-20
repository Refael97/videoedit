import glob, os, sys
from PIL import Image
d = sys.argv[1]
fs = sorted(glob.glob(os.path.join(d, "f*.png")), key=lambda s: float(os.path.basename(s)[1:-4]))
W, H = 360, 640
sh = Image.new("RGB", (W * 6, H * ((len(fs) + 5) // 6)), (20, 20, 20))
for i, f in enumerate(fs):
    sh.paste(Image.open(f).convert("RGB").resize((W, H)), ((i % 6) * W, (i // 6) * H))
sh.save(os.path.join(d, "sheet.jpg"), quality=85)
print(len(fs), "frames")
