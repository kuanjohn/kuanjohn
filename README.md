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

## Project structure

```
worker.js           Edge worker (headers + /api/visit)
wrangler.jsonc      Workers Assets config
public/             Deploy root
src/css, src/js     Sources (copied/compiled on build)
content/            projects.json, knowledge, blog markdown
scripts/            generate-pages, sync-content, copy-js
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
