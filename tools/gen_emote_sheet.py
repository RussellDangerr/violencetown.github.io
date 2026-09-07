#!/usr/bin/env python3
"""Pack a strip of Kenney Emote Pack (Pixel) icons for Violencetown.

SOURCE is the local CC0 Kenney library (sibling of the repos, NOT in-repo — see
CLAUDE.md asset notes). Each run packs ONE named order list from ONE style
folder into a horizontal strip under game/assets-placeholder/kenney/. Re-run
only when changing a set (then update the matching sprite-column table in
game/sprites.js to match the order list used).

Kenney Emote Pack — CC0 1.0. The Pixel emotes are native 16x16.

Two sheets exist as of the manga-impact-marks pass (animation-pass.md §1):
  - Style 1, STYLE1_ORDER -> emotes_style1.png -> EMOTE_SPRITES in sprites.js.
    Every symbol sits in a white speech balloon. Used for dialogue, ambient
    NPC reactions, and the awareness pips — places where the symbol is meant
    to read as something the character is expressing.
  - Style 8, MARKS_ORDER -> emotes_marks.png -> MARK_SPRITES in sprites.js.
    Bare symbol with a thin dark outline, no balloon. Used for combat impact
    marks: a star inside a dialogue bubble reads as someone SAYING "star",
    which is wrong for a hit. (Style 5 was the original plan — the animation
    pass called it "bare, no balloon" — but pixel-checked it is NOT bare in
    this copy of the pack: only 47/256px transparent on the star icon, an
    opaque card same as Style 1's 40/256. Style 8 is the only style in the
    pack that is actually mostly-transparent art, 212/256px on that same
    icon, so it's the one used here.)

Usage:
    python tools/gen_emote_sheet.py                              # Style 1 balloons (default; reproduces emotes_style1.png)
    python tools/gen_emote_sheet.py --style 8 --marks --out emotes_marks.png   # bare impact marks
"""
import argparse
from pathlib import Path
from PIL import Image

# Local CC0 Kenney library (see CLAUDE.md "Repo location" / asset hygiene notes).
KENNEY_EMOTE_ROOT = Path(r"C:\Code\assets\kenney\2D assets\Emote Pack\PNG\Pixel")
OUT_DIR = (Path(__file__).resolve().parent.parent
           / "game" / "assets-placeholder" / "kenney")

CELL = 16

# Column order — KEEP IN SYNC with EMOTE_SPRITES in game/sprites.js.
STYLE1_ORDER = [
    "dots1", "dots2", "dots3", "question", "exclamation", "sleep",
    "music", "anger", "heart", "idea", "laugh", "star",
    "drop", "faceHappy", "faceAngry", "faceSad", "alert", "swirl",
]

# Column order — KEEP IN SYNC with MARK_SPRITES in game/sprites.js.
MARKS_ORDER = [
    "star", "stars", "anger", "drop", "drops", "cross", "swirl", "exclamation",
]


def pack(style, order, out_name):
    src_dir = KENNEY_EMOTE_ROOT / f"Style {style}"
    out = OUT_DIR / out_name
    strip = Image.new("RGBA", (CELL * len(order), CELL), (0, 0, 0, 0))
    for i, name in enumerate(order):
        src = src_dir / f"emote_{name}.png"
        img = Image.open(src).convert("RGBA")
        if img.size != (CELL, CELL):
            img = img.resize((CELL, CELL), Image.NEAREST)
        strip.paste(img, (i * CELL, 0), img)
    out.parent.mkdir(parents=True, exist_ok=True)
    strip.save(out)
    print(f"wrote {out} ({strip.width}x{strip.height}, {len(order)} emotes, Style {style})")
    print("order:", ", ".join(order))


def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--style", type=int, default=1,
                     help="Kenney Pixel style number, 1-8 (default: 1)")
    ap.add_argument("--out", default="emotes_style1.png",
                     help="output filename under game/assets-placeholder/kenney/ (default: emotes_style1.png)")
    ap.add_argument("--marks", action="store_true",
                     help="pack MARKS_ORDER (bare impact marks) instead of STYLE1_ORDER (balloons)")
    args = ap.parse_args()

    order = MARKS_ORDER if args.marks else STYLE1_ORDER
    pack(args.style, order, args.out)


if __name__ == "__main__":
    main()
