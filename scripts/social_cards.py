"""Generate the 1200x630 social preview cards (LinkedIn / Open Graph).

Run by .github/workflows/social-cards.yml. Fetches the essay photographs and
the Inter typeface, then writes PNG cards into src/images.
"""
import io
import sys
import urllib.request
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "images"
W, H = 1200, 630
INTER_ZIP = "https://github.com/rsms/inter/releases/download/v4.0/Inter-4.0.zip"
UNSPLASH = "https://images.unsplash.com/"

PHOTOS = {
    "breogan": UNSPLASH + "photo-1543191878-f6a3e470454e",
    "fashion": UNSPLASH + "photo-1789479772987-a767db71b117",
    "green": "src/images/green-willow-bough.jpg",
    "ireland": UNSPLASH + "photo-1661887332909-93e6c9a4e21a",
    "willpower": UNSPLASH + "photo-1600881329755-8b3afb279b27",
}

CARDS = {
    "social-default.png": ("Mini Theses · Personal archive", "Ana Varela Vilariño",
                           "Research-led essays on culture, design, health and the systems behind everyday life.",
                           ["breogan", "fashion", "green", "ireland"]),
    "social-breogan.png": ("Mythologies", "Breogán's Tower: The Myth That Joins Galicia and Ireland", None, ["breogan"]),
    "social-fashion.png": ("Art, Design & Visual Culture", "When Fashion Was Illegal", None, ["fashion"]),
    "social-green.png": ("Art, Design & Visual Culture", "Green: From Poison to Purity", None, ["green"]),
    "social-ireland-spain.png": ("Politics & Identity", "Ireland and Spain: How History Still Shapes Political Culture", None, ["ireland"]),
    "social-willpower-food.png": ("Health", "Why Do We Talk About Willpower When We Talk About Food?", None, ["willpower"]),
}


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 social-cards"})
    with urllib.request.urlopen(req, timeout=60) as response:
        return response.read()


def load_photo(src):
    if src.startswith("http"):
        data = fetch(src + "?auto=format&fm=jpg&w=1400&q=85")
        return Image.open(io.BytesIO(data)).convert("RGB")
    return Image.open(ROOT / src).convert("RGB")


def load_fonts():
    archive = zipfile.ZipFile(io.BytesIO(fetch(INTER_ZIP)))
    raw = {name: archive.read(f"extras/ttf/Inter-{name}.ttf") for name in ("Regular", "Medium", "SemiBold")}
    return lambda weight, size: ImageFont.truetype(io.BytesIO(raw[weight]), size)


def spaced(draw, xy, text, font, fill, spacing):
    x, y = xy
    for char in text:
        draw.text((x, y), char, font=font, fill=fill)
        x += draw.textlength(char, font=font) + spacing


def wrap(draw, text, font, max_width):
    lines, line = [], ""
    for word in text.split():
        candidate = f"{line} {word}".strip()
        if line and draw.textlength(candidate, font=font) > max_width:
            lines.append(line)
            line = word
        else:
            line = candidate
    lines.append(line)
    return lines


def render(font, kicker, title, subtitle, photos):
    card = Image.new("RGB", (W, H), "white")
    if len(photos) == 1:
        card.paste(ImageOps.fit(photos[0], (600, 630), Image.LANCZOS), (600, 0))
    else:
        gap = 4
        cell = ((600 - gap) // 2, (630 - gap) // 2)
        for index, photo in enumerate(photos):
            x = 600 + (index % 2) * (cell[0] + gap)
            y = (index // 2) * (cell[1] + gap)
            card.paste(ImageOps.fit(photo, cell, Image.LANCZOS), (x, y))

    draw = ImageDraw.Draw(card)
    spaced(draw, (64, 70), kicker.upper(), font("Medium", 15), "#111111", 2.5)
    draw.rectangle((64, 104, 104, 105), fill="#111111")

    size = 52
    while True:
        title_font = font("SemiBold", size)
        lines = wrap(draw, title, title_font, 470)
        if len(lines) <= 4:
            break
        size -= 4
    y = 150
    for line in lines:
        draw.text((64, y), line, font=title_font, fill="#111111")
        y += round(size * 1.12)

    if subtitle:
        y += 16
        sub_font = font("Regular", 21)
        for line in wrap(draw, subtitle, sub_font, 460):
            draw.text((64, y), line, font=sub_font, fill="#555555")
            y += 32

    draw.rectangle((64, 540, 536, 540), fill="#e6e3de")
    name_font = font("SemiBold", 15)
    draw.text((64, 562), "Ana Varela Vilariño", font=name_font, fill="#111111")
    offset = 64 + draw.textlength("Ana Varela Vilariño", font=name_font) + 28
    draw.text((offset, 562), "Mini Theses · ana-varela.vercel.app", font=font("Regular", 15), fill="#767676")
    return card


def main():
    font = load_fonts()
    photos = {key: load_photo(src) for key, src in PHOTOS.items()}
    for filename, (kicker, title, subtitle, keys) in CARDS.items():
        image = render(font, kicker, title, subtitle, [photos[key] for key in keys])
        image.save(OUT / filename, "PNG", optimize=True)
        print("wrote", filename, image.size)


if __name__ == "__main__":
    sys.exit(main())
