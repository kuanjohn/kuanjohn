"""Travel journal generator (called from generate-pages.py).

Reads content/journal/<trip>/trip.json plus one JSON file per day in
content/journal/<trip>/days/YYYY-MM-DD.json and writes static pages:

  /journal                      -> public/journal.html
  /journal/<trip>               -> public/journal/<trip>.html          (index + day cards)
  /journal/<trip>/<YYYY-MM-DD>  -> public/journal/<trip>/<date>.html   (one per trip day)
  /journal/<trip>/sample        -> public/journal/<trip>/sample.html   (template preview)

Days without a JSON file still get a page with an empty state, so links never 404.
Photos are referenced by file stem and resolved under trip["media_base"]; each
photo has a 640px and a full-size (<=1600px) WebP made by scripts/journal-photos.py.
Standard library only, so the Cloudflare build image does not need Pillow.
"""
from __future__ import annotations

import json
import re
from datetime import date, timedelta
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content" / "journal"
PUBLIC = ROOT / "public"
SITE = "https://me.jkuan.workers.dev"
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

WEEKDAY_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
WEEKDAY_ZH = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]
MONTH_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

# Runs before the page renders so the chosen language never flashes.
# No JS -> attribute is never set -> both languages show.
LANG_BOOT = """<script>(function(){var l;try{l=new URLSearchParams(location.search).get('lang')||localStorage.getItem('jk-journal-lang');}catch(e){}if(!l){l=((navigator.language||'').toLowerCase().indexOf('zh')===0)?'zh':'en';}if(['en','zh','both'].indexOf(l)<0)l='en';document.documentElement.setAttribute('data-jlang',l);})();</script>"""

TOGGLE = """<div class="jl-toggle" role="group" aria-label="Language / 语言">
  <button type="button" data-jlang-set="en">EN</button>
  <button type="button" data-jlang-set="zh" lang="zh-Hans">中文</button>
  <button type="button" data-jlang-set="both">EN + 中文</button>
</div>"""


class JournalError(SystemExit):
    pass


def L(en: str, zh: str, tag: str = "span", cls: str = "", raw: bool = False) -> str:
    """Bilingual pair. CSS hides one side based on <html data-jlang>."""
    e = en if raw else escape(en or "")
    z = zh if raw else escape(zh or "")
    c = f" {cls}" if cls else ""
    return (f'<{tag} class="jl-en{c}" lang="en">{e}</{tag}>'
            f'<{tag} class="jl-zh{c}" lang="zh-Hans">{z}</{tag}>')


def paragraphs(text: str, lang: str) -> str:
    paras = [p.strip() for p in re.split(r"\n\s*\n", text or "") if p.strip()]
    cls = "jl-en" if lang == "en" else "jl-zh"
    attr = "en" if lang == "en" else "zh-Hans"
    inner = "".join(f"<p>{escape(p).replace(chr(10), '<br/>')}</p>" for p in paras)
    return f'<div class="{cls} journal-story" lang="{attr}">{inner}</div>'


def fmt_en(d: date, year: bool = True) -> str:
    s = f"{WEEKDAY_EN[d.weekday()]} {d.day} {MONTH_EN[d.month - 1]}"
    return f"{s} {d.year}" if year else s


def fmt_zh(d: date, year: bool = True) -> str:
    s = f"{d.month}月{d.day}日 {WEEKDAY_ZH[d.weekday()]}"
    return f"{d.year}年{s}" if year else s


def load_trip(trip_dir: Path) -> dict:
    trip = json.loads((trip_dir / "trip.json").read_text(encoding="utf-8"))
    trip["_start"] = date.fromisoformat(trip["start"])
    trip["_end"] = date.fromisoformat(trip["end"])
    return trip


def city_for(trip: dict, d: date) -> str:
    for leg in trip.get("itinerary", []):
        if date.fromisoformat(leg["from"]) <= d <= date.fromisoformat(leg["to"]):
            return leg["city"]
    return ""


def city_label(trip: dict, key: str) -> tuple[str, str]:
    c = trip["cities"].get(key)
    if not c:
        return key, key
    return c["en"], c["zh"]


def load_day(path: Path, trip: dict) -> dict:
    try:
        day = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise JournalError(f"journal: {path.relative_to(ROOT)} is not valid JSON: {exc}")
    where = path.relative_to(ROOT)
    for key in ("title_en", "title_zh"):
        if not str(day.get(key, "")).strip():
            raise JournalError(f"journal: {where} is missing '{key}'")
    photos = day.get("photos") or []
    folder = day.get("photo_dir") or day.get("date")
    for i, p in enumerate(photos):
        for k in ("file", "w", "h"):
            if k not in p:
                raise JournalError(f"journal: {where} photo #{i + 1} is missing '{k}'")
        if trip["media_base"].startswith("/"):
            # Static-asset storage: fail the build rather than publish a broken image.
            for size in ("640", "1600"):
                f = PUBLIC / trip["media_base"].lstrip("/") / folder / f"{p['file']}-{size}.webp"
                if not f.exists():
                    raise JournalError(f"journal: {where} photo '{p['file']}' -> missing {f.relative_to(ROOT)}")
    cover = int(day.get("cover", 0) or 0)
    if photos and not 0 <= cover < len(photos):
        raise JournalError(f"journal: {where} cover index {cover} is out of range")
    day["_folder"] = folder
    day["_photos"] = photos
    day["_cover"] = photos[cover] if photos else None
    return day


def img_tag(trip: dict, folder: str, p: dict, sizes: str, cls: str, alt: str, eager: bool = False) -> str:
    base = f"{trip['media_base']}/{folder}/{p['file']}"
    w, h = int(p["w"]), int(p["h"])
    sw = min(640, w)
    sh = round(h * sw / w)
    srcset = f"{base}-640.webp {sw}w, {base}-1600.webp {w}w"
    loading = 'loading="eager" fetchpriority="high"' if eager else 'loading="lazy"'
    return (f'<img src="{base}-640.webp" srcset="{srcset}" sizes="{sizes}" width="{sw}" height="{sh}" '
            f'{loading} decoding="async" alt="{escape(alt)}" class="{cls}"/>')


def day_list(trip: dict) -> list[date]:
    out, d = [], trip["_start"]
    while d <= trip["_end"]:
        out.append(d)
        d += timedelta(days=1)
    return out


def sample_banner() -> str:
    return ('<div class="journal-sample-banner" role="note">'
            + L("Sample entry — a layout template with placeholder photos. Not a real day of the trip.",
                "示例条目 —— 仅为版式模板，照片为占位图，并非真实行程。", "p")
            + "</div>")


def render_day_page(trip: dict, d: date | None, day: dict | None, idx: int | None,
                    prev_d: date | None, next_d: date | None, sample: bool = False) -> str:
    slug = trip["slug"]
    if sample:
        city_key = day.get("city", "")
    else:
        city_key = (day or {}).get("city") or city_for(trip, d)
    c_en, c_zh = city_label(trip, city_key)
    if sample:
        eyebrow = L(f"Sample · {c_en}", f"示例 · {c_zh}")
    else:
        eyebrow = L(f"Day {idx} · {c_en} · {fmt_en(d)}", f"第{idx}天 · {c_zh} · {fmt_zh(d)}")

    head = f'''{LANG_BOOT}
<section class="section-pad pb-8"><div class="container-max max-w-4xl">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <a href="/journal/{slug}" class="link-draw text-sm">{L("← All days", "← 全部日程")}</a>
    {TOGGLE}
  </div>
  {sample_banner() if sample else ""}
  <p class="eyebrow mt-10">{eyebrow}</p>'''

    if not day:
        body = head + f'''
  <h1 class="display mt-4 text-4xl md:text-5xl">{L("Not written yet", "尚未更新")}</h1>
  <div class="glass-card mt-10 p-8 text-center">
    <p class="text-4xl" aria-hidden="true">✎</p>
    {L("This day's photos and story will be posted in the evening (Malaysia time). Check back soon.",
       "这一天的照片和故事会在当晚（马来西亚时间）更新，敬请期待。", "p", "mt-4 text-fg/60")}
    <a href="/journal/{slug}" class="btn-ghost mt-6 inline-flex">{L("See written days", "查看已更新的日子")}</a>
  </div>
</div></section>'''
    else:
        folder = day["_folder"]
        photos = day["_photos"]
        hero = ""
        if day["_cover"]:
            cv = day["_cover"]
            hero = ('<div class="glass-card mt-8 overflow-hidden p-0">'
                    + img_tag(trip, folder, cv, "(min-width: 1024px) 896px, 100vw",
                              "aspect-[16/10] w-full object-cover", cv.get("caption_en") or day["title_en"], eager=True)
                    + "</div>")
        story = paragraphs(day.get("story_en", ""), "en") + paragraphs(day.get("story_zh", ""), "zh")
        gallery = ""
        if photos:
            figs = []
            for i, p in enumerate(photos):
                full = f"{trip['media_base']}/{folder}/{p['file']}-1600.webp"
                cap_en, cap_zh = p.get("caption_en", ""), p.get("caption_zh", "")
                caption = (f'<figcaption class="p-3 text-left text-xs text-fg/55">{L(cap_en, cap_zh)}</figcaption>'
                           if (cap_en or cap_zh) else "")
                figs.append(
                    f'<figure class="journal-photo glass-card mb-4 overflow-hidden p-0">'
                    f'<button type="button" class="block w-full" data-full="{full}" data-cap-en="{escape(cap_en)}" '
                    f'data-cap-zh="{escape(cap_zh)}" aria-label="{escape(cap_en or f"Photo {i + 1}")}">'
                    + img_tag(trip, folder, p, "(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw",
                              "h-auto w-full", cap_en or f"Photo {i + 1}")
                    + f"</button>{caption}</figure>")
            gallery = f'''
<section class="section-pad pt-0"><div class="container-max max-w-5xl">
  <p class="eyebrow mb-6">{L(f"Photos · {len(photos)}", f"照片 · {len(photos)}张")}</p>
  <div id="journal-gallery" class="columns-1 gap-4 sm:columns-2 lg:columns-3">{"".join(figs)}</div>
</div></section>'''
        body = head + f'''
  <h1 class="display mt-4 text-4xl leading-tight md:text-5xl">{L(day["title_en"], day["title_zh"])}</h1>
  {hero}
  <article class="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-fg/75">{story}</article>
</div></section>{gallery}'''

    if not sample:
        nav = []
        if prev_d:
            nav.append(f'<a class="btn-ghost" href="/journal/{slug}/{prev_d.isoformat()}">← {L(fmt_en(prev_d, False), fmt_zh(prev_d, False))}</a>')
        else:
            nav.append("<span></span>")
        if next_d:
            nav.append(f'<a class="btn-ghost" href="/journal/{slug}/{next_d.isoformat()}">{L(fmt_en(next_d, False), fmt_zh(next_d, False))} →</a>')
        body += f'<section class="section-pad pt-0"><div class="container-max flex max-w-4xl flex-wrap justify-between gap-4">{"".join(nav)}</div></section>'
    return body


def render_card(trip: dict, d: date, idx: int, day: dict | None) -> str:
    slug = trip["slug"]
    city_key = (day or {}).get("city") or city_for(trip, d)
    c_en, c_zh = city_label(trip, city_key)
    when = L(f"Day {idx} · {fmt_en(d, False)}", f"第{idx}天 · {fmt_zh(d, False)}")
    city = f'<span class="chip">{L(c_en, c_zh)}</span>'
    href = f"/journal/{slug}/{d.isoformat()}"
    if day:
        cover = day["_cover"]
        media = (img_tag(trip, day["_folder"], cover, "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw",
                         "aspect-[4/3] w-full object-cover", day["title_en"])
                 if cover else '<div class="journal-cover-empty aspect-[4/3] w-full"></div>')
        title = L(day["title_en"], day["title_zh"], "h3", "display mt-2 text-lg leading-snug")
        return (f'<a href="{href}" class="glass-card block overflow-hidden p-0" data-aos="fade-up">{media}'
                f'<div class="p-5"><div class="flex items-center justify-between gap-3"><p class="eyebrow">{when}</p>{city}</div>{title}</div></a>')
    return (f'<a href="{href}" class="glass-card journal-card-empty block overflow-hidden p-0">'
            f'<div class="journal-cover-empty flex aspect-[4/3] w-full items-center justify-center text-sm text-fg/40">{L("Coming soon", "即将更新")}</div>'
            f'<div class="p-5"><div class="flex items-center justify-between gap-3"><p class="eyebrow">{when}</p>{city}</div>'
            f'{L("Not written yet", "尚未更新", "h3", "display mt-2 text-lg text-fg/45")}</div></a>')


def render_index(trip: dict, days: dict, has_sample: bool) -> str:
    slug = trip["slug"]
    dates = day_list(trip)
    written = sum(1 for d in dates if d in days)
    cards = "".join(render_card(trip, d, i + 1, days.get(d)) for i, d in enumerate(dates))
    legs = " · ".join(
        f"{city_label(trip, leg['city'])[0]} {date.fromisoformat(leg['from']).day}–{date.fromisoformat(leg['to']).day} Dec"
        for leg in trip["itinerary"] if leg["from"] != leg["to"])
    legs_zh = " · ".join(
        f"{city_label(trip, leg['city'])[1]} 12月{date.fromisoformat(leg['from']).day}–{date.fromisoformat(leg['to']).day}日"
        for leg in trip["itinerary"] if leg["from"] != leg["to"])
    sample = ""
    if has_sample and written == 0:
        sample = f'''
<section class="section-pad pt-0"><div class="container-max">
  <a href="/journal/{slug}/sample" class="glass-card flex flex-col gap-2 p-6 md:flex-row md:items-center md:justify-between">
    <div><p class="eyebrow">{L("Preview", "预览")}</p>
    {L("See what a day will look like (sample entry with placeholder photos)", "看看每天的日记会是什么样子（示例条目，占位照片）", "p", "mt-2 text-fg/70")}</div>
    <span class="link-draw text-sm">{L("Open sample →", "打开示例 →")}</span>
  </a>
</div></section>'''
    return f'''{LANG_BOOT}
<section class="section-pad border-b border-line/5"><div class="container-max">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <p class="eyebrow">{L("Travel journal", "旅行日记")}</p>
    {TOGGLE}
  </div>
  <h1 class="display mt-4 text-4xl md:text-6xl">{L(trip["title_en"], trip["title_zh"])}</h1>
  {L(trip["subtitle_en"], trip["subtitle_zh"], "p", "mt-6 max-w-2xl text-lg text-fg/60")}
  <div class="mt-8 flex flex-wrap gap-2">
    <span class="chip">{L(legs, legs_zh)}</span>
    <span class="chip">{L(f"{written} of {len(dates)} days written", f"已更新 {written}/{len(dates)} 天")}</span>
  </div>
</div></section>{sample}
<section class="section-pad"><div class="container-max">
  <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{cards}</div>
</div></section>'''


def render_hub(trips: list[tuple[dict, dict]]) -> str:
    cards = []
    for trip, days in trips:
        written = [d for d in day_list(trip) if d in days]
        cover = ""
        for d in reversed(written):
            if days[d]["_cover"]:
                cover = img_tag(trip, days[d]["_folder"], days[d]["_cover"], "(min-width: 768px) 50vw, 100vw",
                                "aspect-video w-full object-cover", trip["title_en"])
                break
        if not cover:
            cover = '<div class="journal-cover-empty aspect-video w-full"></div>'
        cards.append(f'''<a href="/journal/{trip["slug"]}" class="glass-card block overflow-hidden p-0" data-aos="fade-up">{cover}
<div class="p-6"><p class="eyebrow">{L(f"{trip['_start'].day}–{trip['_end'].day} {MONTH_EN[trip['_end'].month - 1]} {trip['_end'].year}", f"{trip['_end'].year}年{trip['_end'].month}月{trip['_start'].day}–{trip['_end'].day}日")}</p>
{L(trip["title_en"], trip["title_zh"], "h2", "display mt-2 text-2xl")}
{L(trip["subtitle_en"], trip["subtitle_zh"], "p", "mt-2 text-sm text-fg/55")}</div></a>''')
    return f'''{LANG_BOOT}
<section class="section-pad border-b border-line/5"><div class="container-max max-w-3xl">
  <div class="flex flex-wrap items-center justify-between gap-4"><p class="eyebrow">{L("Journal", "日记")}</p>{TOGGLE}</div>
  <h1 class="display mt-4 text-4xl md:text-6xl">{L("Travel journal", "旅行日记")}</h1>
  {L("Daily photos and stories from family trips.", "家庭旅行的每日照片与故事。", "p", "mt-6 text-lg text-fg/55")}
</div></section>
<section class="section-pad"><div class="container-max grid gap-6 md:grid-cols-2">{"".join(cards)}</div></section>'''


def update_sitemap(urls: list[str]) -> None:
    sm = PUBLIC / "sitemap.xml"
    if not sm.exists():
        return
    lines = [ln for ln in sm.read_text().splitlines() if "/journal" not in ln]
    end = next(i for i, ln in enumerate(lines) if "</urlset>" in ln)
    lines[end:end] = [f"  <url><loc>{SITE}{u}</loc></url>" for u in urls]
    sm.write_text("\n".join(lines) + "\n")


def build_journal(write) -> None:
    if not CONTENT.exists():
        return
    trips, sitemap = [], ["/journal"]
    for trip_dir in sorted(p for p in CONTENT.iterdir() if (p / "trip.json").exists()):
        trip = load_trip(trip_dir)
        slug = trip["slug"]
        days: dict[date, dict] = {}
        sample = None
        for f in sorted((trip_dir / "days").glob("*.json")):
            if f.stem == "sample":
                sample = load_day(f, trip)
                continue
            if not DATE_RE.match(f.stem):
                raise JournalError(f"journal: unexpected file {f.relative_to(ROOT)} (name it YYYY-MM-DD.json)")
            d = date.fromisoformat(f.stem)
            if not trip["_start"] <= d <= trip["_end"]:
                raise JournalError(f"journal: {f.name} is outside the trip dates {trip['start']}..{trip['end']}")
            day = load_day(f, trip)
            if day.get("date") and day["date"] != f.stem:
                raise JournalError(f"journal: {f.name} has date {day['date']} (must match the file name)")
            days[d] = day

        t_en, t_zh = trip["title_en"], trip["title_zh"]
        write(f"journal/{slug}.html", f"{t_en} · {t_zh} — Journal — John Kuan",
              escape(trip["subtitle_en"]), render_index(trip, days, sample is not None), f"/journal/{slug}")
        sitemap.append(f"/journal/{slug}")
        dates = day_list(trip)
        for i, d in enumerate(dates):
            day = days.get(d)
            title = f"{day['title_en']} · {day['title_zh']}" if day else f"Day {i + 1} · 第{i + 1}天"
            write(f"journal/{slug}/{d.isoformat()}.html", f"{escape(title)} — {t_en} — John Kuan",
                  escape((day or {}).get("title_en") or f"Day {i + 1} of {t_en}"),
                  render_day_page(trip, d, day, i + 1, dates[i - 1] if i else None,
                                  dates[i + 1] if i + 1 < len(dates) else None),
                  f"/journal/{slug}/{d.isoformat()}")
            if day:
                sitemap.append(f"/journal/{slug}/{d.isoformat()}")
        sample_out = PUBLIC / "journal" / slug / "sample.html"
        if sample:
            write(f"journal/{slug}/sample.html", f"Sample entry — {t_en} — John Kuan", "Sample journal entry (template).",
                  render_day_page(trip, None, sample, None, None, None, sample=True), f"/journal/{slug}/sample")
        elif sample_out.exists():
            sample_out.unlink()
        trips.append((trip, days))

    write("journal.html", "Travel journal — John Kuan", "Daily photos and stories from family trips.",
          render_hub(trips), "/journal")
    update_sitemap(sitemap)
