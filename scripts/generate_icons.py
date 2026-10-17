from pathlib import Path
from math import cos, pi, sin
from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "static" / "icons"
OUT.mkdir(parents=True, exist_ok=True)
SIZE = 96
SCALE = 4
W = SIZE * SCALE
SW = int(2.7 * SCALE)
COLORS = {
    "ink": "#1d211c",
    "muted": "#7c7a70",
    "accent": "#b75438",
    "white": "#fffdf8",
    "forest": "#263c32",
    "sage": "#879581",
    "gold": "#b49a68",
}


def p(x, y):
    return (x * SCALE, y * SCALE)


def line(draw, points, fill=(255, 255, 255, 255), width=SW):
    pts = [p(x, y) for x, y in points]
    draw.line(pts, fill=fill, width=width, joint="curve")
    radius = width // 2
    for x, y in pts:
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=fill)


def circle(draw, box, fill, width=SW):
    draw.ellipse([p(box[0], box[1]), p(box[2], box[3])], outline=fill, width=width)


def arc(draw, box, start, end, fill, width=SW):
    draw.arc([p(box[0], box[1]), p(box[2], box[3])], start=start, end=end, fill=fill, width=width)


def rr(draw, box, radius, fill, width=SW):
    draw.rounded_rectangle(
        [p(box[0], box[1]), p(box[2], box[3])],
        radius=radius * SCALE,
        outline=fill,
        width=width,
    )


def heart_mask():
    mask = Image.new("L", (W, W), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse([p(20, 22), p(51, 53)], fill=255)
    d.ellipse([p(45, 22), p(76, 53)], fill=255)
    d.polygon([p(20, 37), p(76, 37), p(48, 78)], fill=255)
    inner = Image.new("L", (W, W), 0)
    di = ImageDraw.Draw(inner)
    di.ellipse([p(29, 30), p(51, 52)], fill=255)
    di.ellipse([p(45, 30), p(67, 52)], fill=255)
    di.polygon([p(29, 42), p(67, 42), p(48, 70)], fill=255)
    return ImageChops.subtract(mask, inner)


def star_mask():
    mask = Image.new("L", (W, W), 0)
    d = ImageDraw.Draw(mask)
    cx, cy, outer, inner = 48, 47, 30, 13.5
    pts = []
    for i in range(10):
        angle = -pi / 2 + i * pi / 5
        radius = outer if i % 2 == 0 else inner
        pts.append((cx + cos(angle) * radius, cy + sin(angle) * radius))
    d.polygon([p(x, y) for x, y in pts], fill=255)
    return mask


def draw_icon(name, draw):
    fill = (255, 255, 255, 255)
    if name == "home":
        line(draw, [(15, 35), (48, 11), (81, 35), (81, 81), (60, 81), (60, 55), (36, 55), (36, 81), (15, 81), (15, 35)])
    elif name == "bag":
        rr(draw, (17, 31, 79, 83), 7, fill)
        arc(draw, (31, 13, 65, 47), 180, 360, fill)
        line(draw, [(31, 29), (31, 32)])
        line(draw, [(65, 29), (65, 32)])
    elif name == "user":
        circle(draw, (34, 12, 62, 40), fill)
        arc(draw, (18, 46, 78, 105), 180, 360, fill)
        line(draw, [(18, 78), (18, 84)])
        line(draw, [(78, 78), (78, 84)])
    elif name == "search":
        circle(draw, (16, 16, 65, 65), fill)
        line(draw, [(59, 59), (81, 81)])
    elif name == "back":
        line(draw, [(63, 17), (27, 48), (63, 79)])
    elif name == "arrow-right":
        line(draw, [(20, 48), (76, 48)])
        line(draw, [(55, 27), (76, 48), (55, 69)])
    elif name == "share":
        for box in [(58, 10, 78, 30), (18, 38, 38, 58), (58, 66, 78, 86)]:
            circle(draw, box, fill)
        line(draw, [(36, 45), (60, 25)])
        line(draw, [(36, 52), (60, 71)])
    elif name == "plus":
        line(draw, [(20, 48), (76, 48)])
        line(draw, [(48, 20), (48, 76)])
    elif name == "minus":
        line(draw, [(20, 48), (76, 48)])
    elif name == "close":
        line(draw, [(23, 23), (73, 73)])
        line(draw, [(73, 23), (23, 73)])
    elif name == "check":
        line(draw, [(20, 49), (40, 69), (77, 28)])
    elif name == "trash":
        line(draw, [(18, 26), (78, 26)])
        line(draw, [(38, 26), (38, 16), (58, 16), (58, 26)])
        line(draw, [(25, 31), (29, 82), (67, 82), (71, 31)])
        line(draw, [(41, 42), (42, 69)])
        line(draw, [(55, 42), (54, 69)])
    elif name == "location":
        circle(draw, (23, 12, 73, 62), fill)
        line(draw, [(27, 51), (48, 85), (69, 51)])
        draw.ellipse([p(41, 30), p(55, 44)], fill=fill)
    elif name == "order":
        rr(draw, (22, 12, 74, 84), 5, fill)
        line(draw, [(34, 32), (62, 32)])
        line(draw, [(34, 47), (62, 47)])
        line(draw, [(34, 62), (52, 62)])
    elif name == "coupon":
        rr(draw, (12, 24, 84, 72), 6, fill)
        line(draw, [(34, 32), (34, 39)])
        line(draw, [(34, 45), (34, 52)])
        line(draw, [(34, 58), (34, 64)])
        line(draw, [(47, 38), (70, 38)])
        line(draw, [(47, 52), (64, 52)])
    elif name == "service":
        arc(draw, (19, 18, 77, 78), 180, 360, fill)
        line(draw, [(19, 50), (19, 66)])
        line(draw, [(77, 50), (77, 66)])
        rr(draw, (13, 55, 27, 76), 5, fill)
        rr(draw, (69, 55, 83, 76), 5, fill)
        arc(draw, (62, 68, 82, 88), 270, 360, fill)
    elif name == "settings":
        circle(draw, (35, 35, 61, 61), fill)
        for i in range(8):
            angle = i * pi / 4
            x1, y1 = 48 + cos(angle) * 26, 48 + sin(angle) * 26
            x2, y2 = 48 + cos(angle) * 36, 48 + sin(angle) * 36
            line(draw, [(x1, y1), (x2, y2)], width=int(SW * 0.9))
    elif name == "shield":
        line(draw, [(48, 10), (79, 23), (75, 52), (48, 86), (21, 52), (17, 23), (48, 10)])
        line(draw, [(33, 47), (44, 59), (65, 36)])
    elif name == "truck":
        rr(draw, (8, 27, 59, 67), 4, fill)
        line(draw, [(59, 39), (77, 39), (87, 52), (87, 67), (59, 67)])
        circle(draw, (17, 67, 35, 85), fill)
        circle(draw, (66, 67, 84, 85), fill)
        line(draw, [(47, 39), (47, 67)])
    elif name == "leaf":
        line(draw, [(22, 75), (73, 22)])
        line(draw, [(31, 66), (23, 38), (43, 23), (67, 27), (76, 52), (56, 71), (31, 66)])
        line(draw, [(44, 53), (54, 59)])
    elif name == "lock":
        rr(draw, (21, 42, 75, 83), 6, fill)
        arc(draw, (30, 19, 66, 55), 180, 360, fill)
        line(draw, [(30, 43), (30, 45)])
        line(draw, [(66, 43), (66, 45)])
        draw.ellipse([p(44, 55), p(52, 63)], fill=fill)
        line(draw, [(48, 62), (48, 70)], width=int(SW * 0.8))
    elif name == "filter":
        line(draw, [(17, 29), (79, 29)])
        line(draw, [(17, 48), (79, 48)])
        line(draw, [(17, 67), (79, 67)])
        draw.ellipse([p(28, 24), p(38, 34)], fill=fill)
        draw.ellipse([p(57, 43), p(67, 53)], fill=fill)
        draw.ellipse([p(36, 62), p(46, 72)], fill=fill)
    elif name == "message":
        rr(draw, (12, 18, 84, 70), 12, fill)
        line(draw, [(29, 70), (22, 85), (44, 71)])
        draw.ellipse([p(30, 41), p(37, 48)], fill=fill)
        draw.ellipse([p(46, 41), p(53, 48)], fill=fill)
        draw.ellipse([p(62, 41), p(69, 48)], fill=fill)
    else:
        raise ValueError(name)


def save_icon(name, color_name, hex_color):
    img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    draw_icon(name, d)
    mask = img.getchannel("A")
    result = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    solid = Image.new("RGBA", (W, W), hex_color)
    result.paste(solid, (0, 0), mask)
    result = result.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    suffix = "" if color_name == "ink" else f"-{color_name}"
    result.save(OUT / f"{name}{suffix}.png")


def save_mask_icon(name, color_name, hex_color, mask):
    suffix = "" if color_name == "ink" else f"-{color_name}"
    result = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    solid = Image.new("RGBA", (W, W), hex_color)
    result.paste(solid, (0, 0), mask)
    result = result.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    result.save(OUT / f"{name}{suffix}.png")


def main():
    line_icons = [
        "home", "bag", "user", "search", "back", "arrow-right", "share", "plus",
        "minus", "close", "check", "trash", "location", "order", "coupon", "service",
        "settings", "shield", "truck", "leaf", "lock", "filter", "message",
    ]
    for name in line_icons:
        for color_name, hex_color in COLORS.items():
            save_icon(name, color_name, hex_color)

    heart = heart_mask()
    star = star_mask()
    for color_name, hex_color in COLORS.items():
        save_mask_icon("heart", color_name, hex_color, heart)
        save_mask_icon("star", color_name, hex_color, star)

    print(f"Generated {len(line_icons) * len(COLORS) + len(COLORS) * 2} icons in {OUT}")


if __name__ == "__main__":
    main()