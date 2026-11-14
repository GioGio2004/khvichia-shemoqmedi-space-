"""
Makes the font used for outlined text (the hollow name on the contact sheet,
and the "outline" effect on the skill names).

Why: Inter is a variable font, and its letters are drawn from overlapping
shapes (the arm and the leg of the K, the two strokes of the v). Filled, that
never shows. Outlined with -webkit-text-stroke, every shape gets its own
outline, so the overlaps show as notches inside the letters. This script
takes the same Inter file the page uses, fixes it at weight 600, merges the
overlapping shapes into one, keeps only the basic Latin letters, and writes
src/assets/fonts/inter-latin-600-outline.woff2. The stylesheet loads it as
'GK Outline'.

Run it again only if the Inter package is updated or outlined text needs a
different weight:

    pip install fonttools skia-pathops brotli
    python scripts/outline-font.py
"""

from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.ttLib.removeOverlaps import removeOverlaps
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"
TARGET = ROOT / "src/assets/fonts/inter-latin-600-outline.woff2"
WEIGHT = 600

font = TTFont(SOURCE)
font.flavor = None
font = instancer.instantiateVariableFont(font, {"wght": WEIGHT}, inplace=False)
removeOverlaps(font)

# Basic Latin is all that outlined text uses (names of people and tools).
options = Options()
options.layout_features = ["*"]
options.name_IDs = ["*"]
subsetter = Subsetter(options)
subsetter.populate(unicodes=range(0x20, 0x7F))
subsetter.subset(font)

font.flavor = "woff2"
TARGET.parent.mkdir(parents=True, exist_ok=True)
font.save(TARGET)
print(f"{TARGET.relative_to(ROOT)}: {TARGET.stat().st_size} bytes, {len(font.getGlyphOrder())} glyphs")
