"""Privacy pass for the fuelling screen: erase the name, the plate and the card with the row's own background colour.
The dummy text is drawn afterwards by tools/dummy_text.cjs (browser fonts). Run from the project root."""
from PIL import Image
im = Image.open("assets/raw/frames/fuel_61.5.png").convert("RGB"); px = im.load()
def wipe(x0, y0, x1, y1, sx):  # fill each row with the colour of a clean column in that row
    for y in range(y0, y1):
        c = px[sx, y]
        for x in range(x0, x1): px[x, y] = c
wipe(150, 118, 424, 162, 120)   # "היי רפאל, נתחיל לתדלק?"
wipe(362, 644, 470, 678, 284)   # car plate
wipe(96, 726, 212, 760, 284)    # card number
im.save("assets/raw/frames/fuel_wiped.png")
