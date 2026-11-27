#!/usr/bin/env python3
"""Prepare travel-journal photos: auto-rotate, resize, compress to WebP, strip ALL metadata.

Usage:
  python3 scripts/journal-photos.py 2026-12-03 ~/Downloads/day3/*.jpg
  python3 scripts/journal-photos.py 2026-12-03 photo1.heic photo2.jpg --trip china-2026
  python3 scripts/journal-photos.py sample placeholder-*.jpg          # the sample entry

For each input photo it writes two files into public/<media_base>/<date>/:
  NN-<hash>-640.webp    (cards, phones)        max 640px wide
  NN-<hash>-1600.webp   (day page, lightbox)   max 1600px on the long edge
and appends {file, w, h, caption_en, caption_zh} to content/journal/<trip>/days/<date>.json,
creating that file (with empty title/story fields to fill in) if it does not exist yet.

Privacy: the output is rebuilt from raw pixels, so EXIF (GPS, camera serial, timestamps),
XMP and IPTC are never written. The script re-opens every output file and aborts if any
metadata survived. Requires Pillow (pip install Pillow); HEIC needs pillow-heif.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required: pip install Pillow  (HEIC: pip install pillow-heif)")

try:  # optional iPhone HEIC support
    from pillow_heif import register_heif_opener

    register_heif_opener()
except ImportError:
    pass

ROOT = Path(__file__).resolve().parents[1]
SIZES = {"640": 640, "1600": 1600}


def clean_copy(im: Image.Image) -> Image.Image:
    """Return a metadata-free RGB copy (orientation already applied)."""
    im = ImageOps.exif_transpose(im)
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
    if im.mode == "RGBA":
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    fresh = Image.frombytes("RGB", im.size, im.tobytes())  # no info / exif / xmp / icc carried over
    return fresh


def resized(im: Image.Image, long_edge: int, by_width: bool) -> Image.Image:
    w, h = im.size
    scale = (long_edge / w) if by_width else (long_edge / max(w, h))
    if scale >= 1:
        return im.copy()
    return im.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)


def assert_clean(path: Path) -> None:
    with Image.open(path) as chk:
        leaked = [k for k in ("exif", "xmp", "XML:com.adobe.xmp", "icc_profile") if chk.info.get(k)]
        if leaked or len(chk.getexif()):
            path.unlink(missing_ok=True)
            sys.exit(f"ABORT: metadata {leaked or ['exif']} survived in {path}")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("date", help="YYYY-MM-DD of the journal day (or 'sample')")
    ap.add_argument("photos", nargs="+", type=Path)
    ap.add_argument("--trip", default="china-2026")
    ap.add_argument("--quality", type=int, default=80, help="WebP quality (default 80)")
    args = ap.parse_args()

    trip_dir = ROOT / "content" / "journal" / args.trip
    trip = json.loads((trip_dir / "trip.json").read_text(encoding="utf-8"))
    media_base = trip["media_base"]
    if not media_base.startswith("/"):
        sys.exit("media_base is a remote URL (R2). Upload the files from public/ yourself; see README.")
    out_dir = ROOT / "public" / media_base.lstrip("/") / args.date
    out_dir.mkdir(parents=True, exist_ok=True)

    day_file = trip_dir / "days" / f"{args.date}.json"
    if day_file.exists():
        day = json.loads(day_file.read_text(encoding="utf-8"))
    else:
        day = {"date": args.date, "title_en": "", "title_zh": "", "story_en": "", "story_zh": "", "cover": 0, "photos": []}
    photos = day.setdefault("photos", [])
    known = {p["file"].split("-", 1)[-1] for p in photos}
    n = len(photos)
    total = 0

    for src in args.photos:
        raw = src.read_bytes()
        digest = hashlib.sha1(raw).hexdigest()[:8]
        if digest in known:
            print(f"skip  {src.name} (already added)")
            continue
        with Image.open(src) as im:
            im.load()
            base = clean_copy(im)
        n += 1
        stem = f"{n:02d}-{digest}"
        large = resized(base, SIZES["1600"], by_width=False)
        small = resized(base, SIZES["640"], by_width=True)
        for suffix, variant in (("1600", large), ("640", small)):
            out = out_dir / f"{stem}-{suffix}.webp"
            variant.save(out, "WEBP", quality=args.quality, method=6)
            assert_clean(out)
            total += out.stat().st_size
        photos.append({"file": stem, "w": large.width, "h": large.height, "caption_en": "", "caption_zh": ""})
        known.add(digest)
        print(f"ok    {src.name} -> {stem} ({large.width}x{large.height})")

    day_file.parent.mkdir(parents=True, exist_ok=True)
    day_file.write_text(json.dumps(day, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\n{len(photos)} photo(s) in {day_file.relative_to(ROOT)}; wrote {total / 1024:.0f} KB of WebP to "
          f"{out_dir.relative_to(ROOT)}. Metadata stripped and verified.")
    if not (day.get("title_en") and day.get("title_zh")):
        print("Next: fill in title_en/title_zh, story_en/story_zh and the captions, then `npm run build`.")


if __name__ == "__main__":
    main()
