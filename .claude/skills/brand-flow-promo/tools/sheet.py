import glob, os, sys
from PIL import Image
d = sys.argv[1]
fs = sorted(glob.glob(os.path.join(d, "f*.png")), key=lambda s: float(os.path.basename(s)[1:-4]))
W, H = 640, 360
sh = Image.new("RGB", (W * 3, H * ((len(fs) + 2) // 3)), (20, 20, 20))
for i, f in enumerate(fs): sh.paste(Image.open(f).convert("RGB").resize((W, H)), ((i % 3) * W, (i // 3) * H))
sh.save(os.path.join(d, "sheet.jpg"), quality=88); print(len(fs), "frames")
