# John Kuan — Executive Portfolio

Premium personal site for **John Kuan**: enterprise technology leader and AI-native builder. Deployed on **Cloudflare Workers** (free plan) with Workers Assets.

## Stack

- Cloudflare Workers + Assets
- HTML5, Tailwind CSS, vanilla ES modules
- GSAP + AOS animations
- Optional Cloudflare KV for visitor remember/track

## Quick start

```bash
npm install
npm run build
npm run preview    # wrangler dev
```

## Deploy (free)

```bash
npm run deploy
# or after build:
npx wrangler deploy
```

No config edits required for a first deploy. The Worker serves `public/` and handles `POST /api/visit`.

**There is no CI/CD in this repo:** no GitHub Actions, and no Cloudflare Workers Builds checks on commits, so pushing or merging to `main` does **not** deploy.
Deploy by running `npm run deploy` from a machine where Wrangler is authenticated to the Cloudflare account that owns the `me` Worker on `jkuan.workers.dev`
(`npx wrangler login` once, or set `CLOUDFLARE_API_TOKEN` with *Workers Scripts: Edit* and `CLOUDFLARE_ACCOUNT_ID`). Existing secrets (`SMTP_PASS`) stay on Cloudflare and are not needed to deploy.
Optional: connect the repo in *Cloudflare dashboard → Workers & Pages → me → Settings → Builds* (build: `npm run build`, deploy: `npx wrangler deploy`) to auto-deploy on every push to `main`.

### Optional: visitor tracking (KV)

```bash
npx wrangler kv namespace create VISITORS
```

Add to `wrangler.jsonc`:

```jsonc
"kv_namespaces": [
  { "binding": "VISITORS", "id": "<id-from-create>" }
]
```

Without KV, the optional name/email modal still remembers visitors in `localStorage` + cookie; the API returns `{ persisted: false }`.

## Travel journal (`/journal`)

Bilingual (English / 简体中文) daily travel journal, first trip: **China with the kids, 2–15 Dec 2026**
(Xi'an 2–8 Dec, Beijing 8–15 Dec).

| URL | What |
|-----|------|
| `/journal` | Journal hub (one card per trip) |
| `/journal/china-2026` | Trip index: one card per day (date, city, cover photo, title). Unwritten days show "Coming soon / 即将更新" |
| `/journal/china-2026/2026-12-03` | Day page: title, cover photo, story, photo gallery with lightbox. Unwritten days show an empty state |
| `/journal/china-2026/sample` | Clearly marked **sample entry** with placeholder photos (linked from the index only until the first real day is published) |

Linked from the homepage *I work hard — and enjoy life* tiles (Travel, Photography), the About page, the Gallery page and the ⌘K palette.
Language toggle **EN / 中文 / EN + 中文** on every journal page (remembered per browser; `?lang=zh` / `?lang=en` / `?lang=both` deep links; without JS both languages show).
Journal photos are public — they are *not* blurred behind the visitor unlock like `/gallery`.

### Content model

```
content/journal/china-2026/
  trip.json                 # title/subtitle (EN+ZH), dates, cities, itinerary, media_base
  days/
    sample.json             # the template entry ("sample": true)
    2026-12-03.json         # one file per day, named YYYY-MM-DD.json
public/assets/journal/china-2026/2026-12-03/
  01-1a2b3c4d-640.webp      # card / phone size (made by the photo script)
  01-1a2b3c4d-1600.webp     # full size for the day page + lightbox
```

Day file (`content/journal/china-2026/days/2026-12-03.json`):

```json
{
  "date": "2026-12-03",
  "title_en": "Walking the city wall",
  "title_zh": "骑行古城墙",
  "story_en": "First paragraph...\n\nA blank line starts a new paragraph.",
  "story_zh": "第一段……\n\n空一行开始新段落。",
  "cover": 0,
  "photos": [
    { "file": "01-1a2b3c4d", "w": 1600, "h": 1067, "caption_en": "South Gate at dusk", "caption_zh": "黄昏时的南门" }
  ]
}
```

Optional fields: `"city"` (override the itinerary, e.g. `"xian-beijing"`; keys are in `trip.json`), `"cover"` (index of the cover photo, default 0).
`npm run build` validates every day file (valid JSON, titles present, date inside the trip, every photo file exists) and stops with a clear message instead of publishing a broken page.

### Publish a new day (the nightly workflow)

1. Put the day's originals (JPEG/PNG; HEIC needs `pip install pillow-heif`) somewhere outside the repo, e.g. `journal-inbox/` (git-ignored).
2. Process them (needs Pillow once: `pip install Pillow`):
   ```bash
   python3 scripts/journal-photos.py 2026-12-03 journal-inbox/2026-12-03/*.jpg
   ```
   This auto-rotates, resizes (640px + 1600px WebP, q80, ~100–300 KB each), **strips all EXIF/GPS/XMP** (and re-checks every output),
   writes the files to `public/assets/journal/china-2026/2026-12-03/`, and creates/updates `days/2026-12-03.json` with the photo list.
   Re-running with the same photo is skipped, so adding more photos later is safe.
3. Edit `content/journal/china-2026/days/2026-12-03.json`: `title_en`, `title_zh`, `story_en`, `story_zh`, captions, `cover`.
4. `npm run build` (regenerates `public/journal/**`, the index cards and `sitemap.xml`), then check `npx wrangler dev` → `http://localhost:8787/journal/china-2026`.
5. Commit **both** `content/` and `public/` (this repo commits built output), push.
6. Deploy: `npm run deploy` (see *Deploy* — merging to `main` does not deploy by itself).

To remove the sample later, delete `days/sample.json` and `public/assets/journal/china-2026/sample/`, then rebuild (the sample page is removed automatically).
To start another trip, copy `content/journal/china-2026/` to a new slug and edit `trip.json`.

### Photo storage: Worker static assets (chosen) vs R2

Photos are served as **Workers static assets** from `public/`, deployed with the site.

- **Why:** zero extra setup or credentials (the same `wrangler deploy` ships text and photos together, atomically, and pages can never point to a missing upload);
  static-asset requests are free and don't count toward the free plan's 100k Worker requests/day; served from Cloudflare's edge cache.
  Budget: ~14 days × 10–20 photos × 2 sizes ≈ 300–600 files, ~60–120 MB — well inside the free plan limits (20,000 files per version, 25 MiB per file).
- **Trade-off:** the photos live in git (the repo grows by roughly the same ~100 MB; fine for GitHub, but clones get heavier), and every new photo needs a redeploy (which we do nightly anyway).
- **R2 alternative:** 10 GB free, keeps git small, photos can be uploaded without a redeploy — but needs a bucket, an R2-scoped API token on the publishing machine,
  a separate upload step per photo (`wrangler r2 object put`), and either a public `r2.dev` URL (rate-limited, not meant for production) or a custom domain on a Cloudflare zone
  (or serving through the Worker, which spends Worker requests).
  **Switching later is one line:** set `media_base` in `trip.json` to the R2 public URL and upload the same `public/assets/journal/<trip>/…` files to the bucket.

Filenames include a content hash, so a replaced photo always gets a new URL (no stale caches). The service worker is network-first for pages so a returning visitor sees the newest day.

## Project structure

```
worker.js           Edge worker (headers + /api/visit)
wrangler.jsonc      Workers Assets config
public/             Deploy root
src/css, src/js     Sources (copied/compiled on build)
content/            projects.json, knowledge, blog markdown, journal/<trip>/
scripts/            generate-pages, sync-content, copy-js,
                    journal.py (journal pages), journal-photos.py (photo prep)
```

## Content

- Career & bio from `CV_JK.docx` (PDF at `public/assets/resume/John-Kuan-CV.pdf`)
- Projects linked to [github.com/kuanjohn](https://github.com/kuanjohn)
- Contact: email / phone / LinkedIn / GitHub / resume (no form)

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run build` | Pages + CSS + JS + content |
| `npm run preview` | Local Workers preview |
| `npm run deploy` | Build + deploy |
| `npm run journal:photos -- <date> <files…>` | Resize + strip EXIF/GPS for journal photos |

## Future hooks

Commented / stubbed for: AI chat route, D1/RAG, contact API, visitor admin UI, live project screenshots.

---

## 20 premium enhancements (post-v1)

1. **AI concierge** — Workers AI chat that answers from your knowledge base (RAG over blog + projects).
2. **Interactive architecture demos** — clickable diagrams for CloudiMesh / VCF / SD-WAN deals.
3. **Live product screenshots** — CI job that captures authenticated UIs into WebP.
4. **Case-study microsites** — print-quality PDF export per project for RFP attachments.
5. **Deal timeline storytelling** — animated narrative of the 560-site SD-WAN win.
6. **Speaking / media kit** — one-pager, headshot pack, talk abstracts.
7. **Calendly / booking** — executive scheduling without a contact form.
8. **Multilingual** — EN / 中文 / Bahasa with edge-negotiated language.
9. **Visitor CRM lite** — KV → D1 dashboard of named visitors (private Access).
10. **Cloudflare Access** — protect `/admin` analytics behind Zero Trust.
11. **Web Vitals beacon** — RUM into Analytics Engine.
12. **3D but light** — optional WebGL hero only on high-end devices (still under 2MB budget).
13. **Resume ATS + visual** — dual PDF (classic + designed).
14. **Open-source changelog** — auto-pull latest commits from GitHub into Projects.
15. **Certification vault** — verifiable credential links + PDF lightbox.
16. **Podcast / video embed** — cinematic reel of talks and demos.
17. **Partner logo wall** — animated trust strip with permissioned brands.
18. **Scenario calculator** — “hybrid cloud TCO” interactive toy for prospects.
19. **Newsletter via Resend** — optional opt-in separate from visitor modal.
20. **Design tokens package** — publish the visual system for Rangkaian Intelek / CloudiMesh brand consistency.
