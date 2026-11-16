"""Cuts the pop-out tiles from the full-resolution recording frames (assets/raw/frames) into assets/crops.
Rounded masks are drawn at 4x and downsampled, and every tile is enlarged 2x with LANCZOS. Run from the project root."""
from PIL import Image, ImageDraw, ImageFilter
F = "assets/raw/frames/"
def tile(src, box, out, r=26, scale=2):
    im = Image.open(F + src).convert("RGB").crop(box); w, h = im.size
    im = im.resize((w * scale, h * scale), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
    m = Image.new("L", (w * scale * 4, h * scale * 4), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w * scale * 4 - 1, h * scale * 4 - 1), r * scale * 4, fill=255)
    im.putalpha(m.resize((w * scale, h * scale), Image.LANCZOS)); im.save("assets/crops/" + out); print(out, im.size)
tile("h_43.png", (60, 255, 511, 610), "gold.png", r=30)
tile("g_70.png", (368, 77, 540, 336), "p_can.png", r=22)
tile("g_70.png", (137, 77, 313, 336), "p_paper.png", r=22)
tile("g_104.png", (238, 470, 446, 742), "p_choc.png", r=22)  # a third item that 100 goods already buy (the Loacker card says "200 more")
# the game board: the mouse cursor sits on a face-down tile, so that tile is replaced by its identical neighbour
g = Image.open(F + "g_154.png").convert("RGB"); g.paste(g.crop((385, 364, 531, 507)), (213, 364)); g.save(F + "g_154_clean.png")
tile("g_154_clean.png", (37, 202, 534, 818), "game.png", r=30)
tile("g_116.png", (37, 240, 533, 963), "refer.png", r=30)
