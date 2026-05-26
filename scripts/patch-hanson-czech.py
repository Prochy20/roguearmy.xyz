#!/usr/bin/env python3
"""Patch Hanson-Bold.otf with Czech/Slovak diacritic glyphs.

Hanson Bold ships only Latin-1, so Č Š Ž Ř Ě Ť Ď Ň Ů (and lowercase) fall back
to the OS font and look broken inside Hanson words. This script composes the
missing glyphs from existing base letters + a drawn caron or ring above, then
patches the font in place to a sibling .otf file.

Run:  python3 scripts/patch-hanson-czech.py

Tune the geometry by editing the constants block below, then re-run.
"""

import hashlib
import re
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "fonts" / "Hanson-Bold.otf"
DST = ROOT / "public" / "fonts" / "Hanson-Bold-Czech.otf"
FONTS_TS = ROOT / "src" / "app" / "fonts.ts"
GLOBALS_CSS = ROOT / "src" / "app" / "globals.css"

# ── Diacritic geometry (tweak visually, re-run) ──────────────────────────────
# Ratios are fractions of the font's cap height. The caron is drawn as a
# constant-thickness V-chevron (ˇ): outer V edges at slope ±height/half,
# inner V edges parallel-offset perpendicular by `stroke`. Match the stroke
# ratio to Hanson's native acute weight so Č and Á read at the same mass.
CARON_WIDTH_RATIO   = 0.46   # chevron width across the glyph
CARON_HEIGHT_RATIO  = 0.20   # chevron depth (outer V tip to outer top)
CARON_STROKE_RATIO  = 0.08   # perpendicular stroke thickness of the V
CARON_GAP_RATIO     = 0.14   # gap between glyph top and outer V tip
RING_DIAMETER_RATIO = 0.22
RING_STROKE_RATIO   = 0.07
RING_GAP_RATIO      = 0.12

# Compositions: (target_codepoint, base_codepoint, accent_kind, is_uppercase)
COMPOSITIONS = [
    (0x010C, 0x0043, "caron", True),  (0x010D, 0x0063, "caron", False),  # Č č
    (0x0160, 0x0053, "caron", True),  (0x0161, 0x0073, "caron", False),  # Š š
    (0x017D, 0x005A, "caron", True),  (0x017E, 0x007A, "caron", False),  # Ž ž
    (0x0158, 0x0052, "caron", True),  (0x0159, 0x0072, "caron", False),  # Ř ř
    (0x011A, 0x0045, "caron", True),  (0x011B, 0x0065, "caron", False),  # Ě ě
    (0x0164, 0x0054, "caron", True),  (0x0165, 0x0074, "caron", False),  # Ť ť
    (0x010E, 0x0044, "caron", True),  (0x010F, 0x0064, "caron", False),  # Ď ď
    (0x0147, 0x004E, "caron", True),  (0x0148, 0x006E, "caron", False),  # Ň ň
    (0x016E, 0x0055, "ring",  True),  (0x016F, 0x0075, "ring",  False),  # Ů ů
]

GLYPH_NAME = {
    0x010C: "Ccaron",  0x010D: "ccaron",
    0x0160: "Scaron",  0x0161: "scaron",
    0x017D: "Zcaron",  0x017E: "zcaron",
    0x0158: "Rcaron",  0x0159: "rcaron",
    0x011A: "Ecaron",  0x011B: "ecaron",
    0x0164: "Tcaron",  0x0165: "tcaron",
    0x010E: "Dcaron",  0x010F: "dcaron",
    0x0147: "Ncaron",  0x0148: "ncaron",
    0x016E: "Uring",   0x016F: "uring",
}


def draw_caron(pen, cx, base_y, width, height, stroke):
    """Constant-thickness V-chevron (ˇ). Outer V tip at (cx, base_y),
    flat top edge at y = base_y + height.

    Geometry: outer V edge has slope ±height/half. The inner V edge is
    parallel-offset perpendicular by `stroke`; in the y-axis that vertical
    offset is stroke * arm_len / half, where arm_len = √(half² + height²).
    """
    half = width / 2
    top = base_y + height
    arm_len = (half ** 2 + height ** 2) ** 0.5

    # Vertical shift of the inner V edge (where it crosses x=0).
    c = stroke * arm_len / half
    if c >= height:
        # Stroke too thick — inner edge would cross above the outer top.
        # Fall back to a solid wedge so we never produce a malformed glyph.
        pen.moveTo((cx - half, top))
        pen.lineTo((cx + half, top))
        pen.lineTo((cx, base_y))
        pen.closePath()
        return

    # Inner top x-offset from outer-top: where inner edge meets y = top.
    inner_dx = abs((c - height) * half / height) - 0  # |(c-h)*half/h|... reduce
    # Equivalent simpler form:
    inner_dx = half - (height - c) * half / height
    inner_bottom_y = base_y + c

    pen.moveTo((cx - half, top))                              # outer top-left
    pen.lineTo((cx, base_y))                                  # outer V tip (bottom)
    pen.lineTo((cx + half, top))                              # outer top-right
    pen.lineTo((cx + half - inner_dx, top))                   # inner top-right (move left along top edge)
    pen.lineTo((cx, inner_bottom_y))                          # inner V tip (points up)
    pen.lineTo((cx - half + inner_dx, top))                   # inner top-left
    pen.closePath()


def draw_ring(pen, cx, cy, diameter, stroke):
    """Filled annulus centered at (cx, cy). Outer CW, inner CCW for the hole."""
    r_out = diameter / 2
    r_in = max(r_out - stroke, 1)
    k = 0.5522847498  # cubic-bezier circle approximation

    # outer circle (clockwise)
    pen.moveTo((cx + r_out, cy))
    pen.curveTo((cx + r_out, cy - r_out * k), (cx + r_out * k, cy - r_out), (cx, cy - r_out))
    pen.curveTo((cx - r_out * k, cy - r_out), (cx - r_out, cy - r_out * k), (cx - r_out, cy))
    pen.curveTo((cx - r_out, cy + r_out * k), (cx - r_out * k, cy + r_out), (cx, cy + r_out))
    pen.curveTo((cx + r_out * k, cy + r_out), (cx + r_out, cy + r_out * k), (cx + r_out, cy))
    pen.closePath()

    # inner circle (counter-clockwise → hole)
    pen.moveTo((cx + r_in, cy))
    pen.curveTo((cx + r_in, cy + r_in * k), (cx + r_in * k, cy + r_in), (cx, cy + r_in))
    pen.curveTo((cx - r_in * k, cy + r_in), (cx - r_in, cy + r_in * k), (cx - r_in, cy))
    pen.curveTo((cx - r_in, cy - r_in * k), (cx - r_in * k, cy - r_in), (cx, cy - r_in))
    pen.curveTo((cx + r_in * k, cy - r_in), (cx + r_in, cy - r_in * k), (cx + r_in, cy))
    pen.closePath()


def patch(src_path: Path, dst_path: Path) -> str:
    font = TTFont(str(src_path))

    os2 = font["OS/2"]
    cap_height = getattr(os2, "sCapHeight", 700) or 700
    x_height = getattr(os2, "sxHeight", int(cap_height * 0.7)) or int(cap_height * 0.7)

    print(f"cap_height={cap_height}  x_height={x_height}")

    cmap = font["cmap"].getBestCmap()
    glyph_set = font.getGlyphSet()
    cff = font["CFF "].cff
    top_dict = cff.topDictIndex[0]
    charstrings = top_dict.CharStrings
    hmtx = font["hmtx"]

    added = []
    skipped = []

    for codepoint, base_cp, kind, is_upper in COMPOSITIONS:
        if codepoint in cmap:
            skipped.append((codepoint, "already present"))
            continue
        if base_cp not in cmap:
            skipped.append((codepoint, f"base U+{base_cp:04X} missing"))
            continue

        base_name = cmap[base_cp]
        new_name = GLYPH_NAME[codepoint]
        advance, lsb = hmtx[base_name]

        # Use the actual glyph's bbox top — display-weight fonts often draw
        # past their sCapHeight metric, so anchoring to bounds is more accurate
        # than to the OS/2 cap height.
        bounds_pen = BoundsPen(glyph_set)
        glyph_set[base_name].draw(bounds_pen)
        if bounds_pen.bounds is None:
            skipped.append((codepoint, f"base {base_name} has no bounds"))
            continue
        x_min, _, x_max, base_top = bounds_pen.bounds
        accent_cx = (x_min + x_max) / 2

        pen = T2CharStringPen(advance, glyphSet=glyph_set)
        glyph_set[base_name].draw(pen)

        if kind == "caron":
            w = cap_height * CARON_WIDTH_RATIO
            h = cap_height * CARON_HEIGHT_RATIO
            s = cap_height * CARON_STROKE_RATIO
            gap = cap_height * CARON_GAP_RATIO
            draw_caron(pen, accent_cx, base_top + gap, w, h, s)
        elif kind == "ring":
            d = cap_height * RING_DIAMETER_RATIO
            s = cap_height * RING_STROKE_RATIO
            gap = cap_height * RING_GAP_RATIO
            draw_ring(pen, accent_cx, base_top + gap + d / 2, d, s)

        new_cs = pen.getCharString(private=top_dict.Private, globalSubrs=cff.GlobalSubrs)

        # CFF append: push the charstring into the underlying Index and
        # register the name → new index in the lookup dict. __setitem__ on
        # CharStrings only works for names already present, so for net-new
        # glyphs we manipulate the inner structures directly.
        cs_index = charstrings.charStringsIndex
        cs_index.items.append(new_cs)
        charstrings.charStrings[new_name] = len(cs_index.items) - 1
        if new_name not in top_dict.charset:
            top_dict.charset.append(new_name)

        # hmtx is keyed by name once the glyph is in the glyph order.
        glyph_order = font.getGlyphOrder()
        if new_name not in glyph_order:
            font.setGlyphOrder(glyph_order + [new_name])

        hmtx[new_name] = (advance, lsb)

        for sub in font["cmap"].tables:
            if sub.isUnicode():
                sub.cmap[codepoint] = new_name

        added.append((codepoint, new_name))

    # Refresh maxp glyph count if present
    if "maxp" in font:
        font["maxp"].numGlyphs = len(font.getGlyphOrder())

    # Sweep any legacy hashed builds from earlier iterations of this script,
    # including the older Hanson-Bold-CzExt.* naming scheme.
    sweep_patterns = (
        f"{dst_path.stem}.*.otf",          # new naming with hashed variants
        "Hanson-Bold-CzExt*.otf",          # legacy naming (with or without hash)
    )
    for pattern in sweep_patterns:
        for stale in dst_path.parent.glob(pattern):
            if stale != dst_path:
                stale.unlink()
    if dst_path.exists():
        dst_path.unlink()

    font.save(str(dst_path))
    content = dst_path.read_bytes()
    short_hash = hashlib.sha256(content).hexdigest()[:8]

    print(f"\nAdded {len(added)} glyphs:")
    for cp, name in added:
        print(f"  U+{cp:04X}  →  {name}")
    if skipped:
        print(f"\nSkipped {len(skipped)}:")
        for cp, reason in skipped:
            print(f"  U+{cp:04X}  ({reason})")
    print(f"\nWrote {dst_path.relative_to(ROOT)}  (sha256 {short_hash})")
    return short_hash


def rewrite_references(font_filename: str, cache_bust: str) -> None:
    """Update fonts.ts (clean path) and globals.css (path + ?v=hash for the
    literal @font-face used by Storybook). next/font/local handles cache
    invalidation internally, so it doesn't need the query string."""
    # fonts.ts: any .../<oldname-or-newname>(.hash)?.otf  →  clean filename
    fonts_ts_pattern = re.compile(r"Hanson-Bold-(?:Czech|CzExt)(?:\.[0-9a-f]+)?\.otf")
    original = FONTS_TS.read_text()
    updated, n = fonts_ts_pattern.subn(font_filename, original)
    if n and original != updated:
        FONTS_TS.write_text(updated)
        print(f"  ↻  {FONTS_TS.relative_to(ROOT)}")

    # globals.css: same filename swap, plus a ?v=<hash> query string for cache busting
    css_pattern = re.compile(r"Hanson-Bold-(?:Czech|CzExt)(?:\.[0-9a-f]+)?\.otf(?:\?v=[0-9a-f]+)?")
    original = GLOBALS_CSS.read_text()
    updated, n = css_pattern.subn(f"{font_filename}?v={cache_bust}", original)
    if n and original != updated:
        GLOBALS_CSS.write_text(updated)
        print(f"  ↻  {GLOBALS_CSS.relative_to(ROOT)}")


if __name__ == "__main__":
    short_hash = patch(SRC, DST)
    print("\nRewriting source references:")
    rewrite_references(DST.name, short_hash)
