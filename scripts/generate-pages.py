#!/usr/bin/env python3
"""Generate all HTML pages for the John Kuan portfolio."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
PROJECTS = json.loads((ROOT / "content/projects.json").read_text())

HEAD = '''<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <meta name="description" content="{description}" />
  <meta name="theme-color" content="#05070A" />
  <link rel="canonical" href="https://kuanjohn.workers.dev{path}" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Syne:wght@500;600;700&display=swap" rel="stylesheet" />
  <link href="https://unpkg.com/aos@2.3.4/dist/aos.css" rel="stylesheet" />
  <link rel="stylesheet" href="/css/styles.css" />
  <script type="application/ld+json">{ldjson}</script>
</head>
<body>
  <div id="progress-bar"></div>
  <div id="cursor-ring" class="cursor-ring"></div>
  <canvas id="particle-canvas" aria-hidden="true"></canvas>
  <header id="site-header" class="sticky top-0 z-40 border-b border-white/5 bg-ink/70 backdrop-blur-xl"></header>
  <main class="site-main">{body}</main>
  <footer id="site-footer"></footer>
  <button type="button" id="back-to-top" class="fixed bottom-6 right-6 z-50 rounded-full border border-white/15 bg-ink-50/90 px-4 py-2 text-xs text-white opacity-0 pointer-events-none transition" aria-label="Back to top">Top</button>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" defer></script>
  <script src="https://unpkg.com/aos@2.3.4/dist/aos.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" defer></script>
  <script type="module" src="/js/main.js"></script>
</body>
</html>
'''

LD = json.dumps({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "John Kuan",
  "url": "https://kuanjohn.workers.dev",
  "email": "kuan.john@gmail.com",
  "sameAs": ["https://www.linkedin.com/in/kuanjohn/", "https://github.com/kuanjohn"],
  "jobTitle": "Enterprise Technology Leader",
})


def write(rel, title, description, body, path):
    (PUBLIC / rel).parent.mkdir(parents=True, exist_ok=True)
    (PUBLIC / rel).write_text(HEAD.format(title=title, description=description, path=path, body=body, ldjson=LD))
    print("wrote", rel)


CAREER = [
  ("Splunk / Cisco", "Regional Sales Manager, ROSA", "Jan 2024 – Dec 2025",
   "Leading sales across Malaysia telecom, three major banks, fintech, and Pakistan. Driving Splunk security, observability, and data analytics adoption.",
   ["4× pipeline growth in 6 months", "GTM with direct and partner motions", "AI-driven security & cloud transformation thought leadership", "C-level engagement in banking and telecom"]),
  ("VMware", "Sales Director (ASEAN)", "Jan 2019 – Dec 2023",
   "Led SDDC and Networking Security across ASEAN with exceptional YoY growth and President’s Club recognition.",
   ["25% YoY growth; >USD 30M annual since 2019", "Consistently >130% of target", "30+ strategic partners enabled", "VCF wins in gov/telco (~USD 1M avg)", "Banking VCF/NSX seeding (USD 500k–1M)", "Landmark SD-WAN: 560 sites / USD 3.5M", "President’s Club 2022 — 250% quota (2nd time)"]),
  ("VMware", "Sr Sales Manager, Networking & Security", "Feb 2016 – Dec 2018",
   "Built NSX business in new markets with workshop-led pipeline creation and partner collaboration.",
   ["4× pipeline in 6 months from near-zero", "Consistently >120% of target", "Largest ASEAN NSX ELA ~USD 500k (2016) with major telco", "Bank and enterprise NSX footprint expansion"]),
  ("VMware", "Sr System Engineer (Team Lead)", "Jan 2010 – Jan 2016",
   "Pre-sales Team Lead for the SAM pool — SDDC, NSX, and EUC trusted advisor.",
   ["Technical advocacy that won competitive deals", "Growth plans with Strategic Account Managers", "President’s Club 2016 — 180% quota (1st time)"]),
  ("Hewlett-Packard", "Business Development Manager", "Apr 2006 – 2010",
   "Opportunity qualification, proposals, and Microsoft-centric architectural solutions with principals from Microsoft, VMware, and Citrix.",
   ["Integrated architecture presentations", "Competitive displacement of Microsoft & VMware solutions", "Joint account planning with technology principals"]),
  ("AIG Technology (US)", "Solution Architect", "Jun 2005 – Mar 2006",
   "Global email infrastructure upgrade using Microsoft and Quest best practices.",
   ["100k+ users Exchange 5.5 → 2003", "15k+ Lotus Notes → Exchange", "AD and messaging architecture; resource forest greenfield"]),
  ("NetSecure Advisor Sdn Bhd", "Solution Architect", "Jun 2001 – Jun 2005",
   "Microsoft-focused services from SMB to enterprise — ADS, POCs, and technical sales with Microsoft, HP, and Symantec partners.",
   ["Migrations, server management, security solutions", "Business development and opportunity qualification"]),
  ("Comat Training Services", "Microsoft Certified Trainer", "Jan 2000 – Jun 2001",
   "Delivered MCSE and MCDBA classes; trained hundreds of professionals.",
   ["Windows NT/2000, SQL Server, A+", "NT → 2000 and Exchange migration consulting"]),
]

WORKLIFE = [
  ("Running", "Endurance and clarity — early miles before deep work."),
  ("Golf", "Patience, precision, and competitive calm."),
  ("Camping", "Unplugging under open sky."),
  ("Diving", "Focus under pressure — literally."),
  ("Woodworking", "Building with hands, not only keyboards."),
  ("Travel", "New markets, new cultures, new perspective."),
  ("Photography", "Seeing composition in systems and landscapes."),
  ("Family", "The reason the work matters."),
  ("Healthy lifestyle", "Gym, hiking, reading, and music — sustained energy."),
]

DETAILS = {
  "cloudimesh": {
    "what": "CloudiMesh is a multi-tenant cloud portal for VM request workflows, inventory chargeback, and hybrid cloud governance. Tenants submit sizing requests across VMware, Nutanix, Huawei private cloud, and AWS — with approval flows, RvTools inventory import, and platform administration.",
    "how": ["Multi-tenant Jetstream teams model", "VM catalog & provisioning workflows", "Chargeback projects and cost allocation", "Cloud platform connections per tenant", "Super-admin control plane for governance"],
  },
  "crm": {
    "what": "CloudiMesh CRM imports customer data, ranks by VM footprint, runs outreach campaigns, and qualifies leads via AI chat before sales handoff — so SEs spend time on real opportunities.",
    "how": ["Lead import and ranking", "AI qualification thresholds", "Campaign batch runner with daily limits", "Sales notification handoff", "Audit-friendly outreach history"],
  },
  "propai": {
    "what": "PropAI helps Malaysian landlords and tenants manage rent, compliance reminders, expenses (LHDN-aware), and AI-assisted payment review in one calm workspace.",
    "how": ["Landlord and tenant portals", "Rent tracking and approvals", "Compliance submissions", "Expense guides for rental tax context", "AI inbox for payment review"],
  },
  "ai-services-delivery": {
    "what": "An AI services delivery platform that turns confirmed discovery facts into phased VMware/infrastructure Statements of Work and task-level delivery copilots.",
    "how": ["Multi-provider AI config (Anthropic default)", "Discovery fact capture with citations", "Phased SOW generation", "Task copilots with risks and rollback", "Realtime collaboration hooks"],
  },
  "rangkaian-intelek": {
    "what": "Corporate website for Rangkaian Intelek — cloud, security, observability, and AI automation consulting — statically exported to Cloudflare.",
    "how": ["Next.js App Router static export", "Tailwind design system", "Lead capture patterns", "Cloudflare Pages / Workers deploy"],
  },
  "worldcup-predictor": {
    "what": "Fans predict exact World Cup 2026 scores, stake virtual credits, climb leaderboards, and invite friends — entertainment product velocity with solid Laravel foundations.",
    "how": ["Match sync from football APIs", "Wallet and betting settlement", "Leaderboards and referrals", "Admin sync and user management"],
  },
  "onprem-engine": {
    "what": "On-premises automation engine that connects CloudiMesh portal intents to private cloud runbooks and hypervisor operations.",
    "how": ["Job queue for on-prem tasks", "Connector model for private cloud", "Operational logging", "Bridge between SaaS portal and datacenter"],
  },
}


def page_hero(eyebrow, title, lead):
    return f'''
<section class="section-pad border-b border-white/5">
  <div class="container-max max-w-3xl">
    <p class="eyebrow">{eyebrow}</p>
    <h1 class="display mt-4 text-4xl md:text-6xl">{title}</h1>
    <p class="mt-6 text-lg text-white/55">{lead}</p>
  </div>
</section>'''


# HOME
wl = "".join(f'<div class="glass-card p-5" data-aos="fade-up"><p class="display text-lg">{a}</p></div>' for a, _ in WORKLIFE[:9])
write("index.html", "John Kuan — Enterprise Technology Leader & AI Builder",
      "Enterprise technology leader and AI-native problem solver.",
      f'''
<section class="section-pad relative min-h-[92vh] flex items-center">
  <div class="pointer-events-none absolute inset-0 -z-10">
    <div class="absolute left-1/2 top-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-blue/20 blur-[100px] animate-aurora"></div>
    <div class="absolute right-1/4 top-1/3 h-56 w-56 rounded-full bg-accent-cyan/15 blur-[90px] animate-aurora"></div>
  </div>
  <div class="container-max grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
    <div>
      <p class="eyebrow" data-hero>Portfolio</p>
      <h1 class="display mt-4 text-5xl leading-[1.05] md:text-7xl" data-hero>John Kuan</h1>
      <p class="mt-5 text-2xl text-accent-cyan md:text-3xl" data-hero>
        <span id="rotating-title" data-titles='["Enterprise Technology Leader","Cloud Architect","AI Builder","AI-Native Problem Solver","Infrastructure Strategist"]'>Enterprise Technology Leader</span>
      </p>
      <p class="mt-6 max-w-xl text-lg text-white/60" data-hero>Enterprise leader who closes multimillion-dollar infrastructure outcomes — and ships real systems by solving problems with AI tools (Cursor, MCP, agents), not decks.</p>
      <div class="mt-10 flex flex-wrap gap-4" data-hero>
        <a href="/career" class="btn-primary magnetic" data-magnetic>View Experience</a>
        <a href="/projects" class="btn-ghost magnetic" data-magnetic>Projects</a>
        <a href="/assets/resume/John-Kuan-CV.pdf" class="btn-ghost magnetic" data-magnetic download>Download Resume</a>
      </div>
    </div>
    <div class="glass-card relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden p-0" data-hero>
      <div class="flex h-full flex-col items-center justify-center bg-gradient-to-br from-ink-100 to-ink-200 p-8 text-center">
        <div class="flex h-36 w-36 items-center justify-center rounded-full border border-accent-cyan/30 bg-ink text-4xl font-display text-accent-cyan">JK</div>
        <p class="mt-6 text-sm text-white/50">Professional photo placeholder</p>
      </div>
    </div>
  </div>
</section>
<section class="section-pad border-t border-white/5"><div class="container-max grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
  <div class="glass-card p-6" data-aos="fade-up"><p class="text-4xl display"><span data-count="20" data-suffix="+">0</span></p><p class="mt-2 text-sm text-white/50">Years Experience</p></div>
  <div class="glass-card p-6" data-aos="fade-up"><p class="text-4xl display"><span data-count="30" data-prefix="USD " data-suffix="M+">0</span></p><p class="mt-2 text-sm text-white/50">Annual Portfolio</p></div>
  <div class="glass-card p-6" data-aos="fade-up"><p class="text-4xl display"><span data-count="560">0</span></p><p class="mt-2 text-sm text-white/50">SD-WAN Sites</p></div>
  <div class="glass-card p-6" data-aos="fade-up"><p class="text-4xl display"><span data-count="2" data-suffix="×">0</span></p><p class="mt-2 text-sm text-white/50">President’s Club</p></div>
</div></section>
<section class="section-pad border-t border-white/5"><div class="container-max">
  <p class="eyebrow">AI &amp; Tools</p>
  <h2 class="display mt-3 max-w-3xl text-3xl md:text-5xl">Problem → tool → outcome</h2>
  <p class="mt-4 max-w-2xl text-white/55">Cursor agents, MCP, and LLM APIs turn infrastructure expertise into shipped software.</p>
  <div class="mt-12 grid gap-6 md:grid-cols-3">
    <article class="glass-card p-6" data-aos="fade-up"><p class="eyebrow">Hybrid cloud</p><h3 class="display mt-2 text-xl">CloudiMesh</h3><p class="mt-3 text-sm text-white/55">Agent-assisted multi-tenant cloud portal.</p><a class="link-draw mt-4 text-sm" href="/projects/cloudimesh">Case study →</a></article>
    <article class="glass-card p-6" data-aos="fade-up"><p class="eyebrow">Delivery AI</p><h3 class="display mt-2 text-xl">SOW copilots</h3><p class="mt-3 text-sm text-white/55">Claude-powered VMware delivery documents.</p><a class="link-draw mt-4 text-sm" href="/projects/ai-services-delivery">Case study →</a></article>
    <article class="glass-card p-6" data-aos="fade-up"><p class="eyebrow">Sales AI</p><h3 class="display mt-2 text-xl">CRM qualification</h3><p class="mt-3 text-sm text-white/55">AI chat scoring before sales handoff.</p><a class="link-draw mt-4 text-sm" href="/projects/crm">Case study →</a></article>
  </div>
</div></section>
<section class="section-pad border-t border-white/5"><div class="container-max"><p class="eyebrow mb-8 text-center">Trusted technologies</p>
<div class="marquee"><div class="marquee-track gap-12 text-sm font-semibold text-white/40">
{" ".join(f"<span class='px-4 hover:text-white transition'>{t}</span>" for t in ["VMware","AWS","Azure","GCP","Splunk","Kubernetes","Linux","Terraform","Ansible","Laravel","Cloudflare","OpenAI","Cursor AI"]*2)}
</div></div></div></section>
<section class="section-pad border-t border-white/5"><div class="container-max flex justify-between gap-6"><div><p class="eyebrow">Selected work</p><h2 class="display mt-3 text-3xl">Featured projects</h2></div><a href="/projects" class="btn-ghost">All projects</a></div>
<div class="container-max mt-10 grid gap-6 md:grid-cols-2">
<a href="/projects/cloudimesh" class="glass-card block overflow-hidden p-0" data-aos="fade-up"><img src="/assets/projects/cloudimesh/01-overview.svg" class="aspect-video w-full object-cover" alt="CloudiMesh" loading="lazy"/><div class="p-6"><h3 class="display text-xl">CloudiMesh</h3><p class="mt-2 text-sm text-white/55">Hybrid cloud portal.</p></div></a>
<a href="/projects/propai" class="glass-card block overflow-hidden p-0" data-aos="fade-up"><img src="/assets/projects/propai/01-overview.svg" class="aspect-video w-full object-cover" alt="PropAI" loading="lazy"/><div class="p-6"><h3 class="display text-xl">PropAI</h3><p class="mt-2 text-sm text-white/55">Property ops + AI review.</p></div></a>
</div></section>
<section class="section-pad border-t border-white/5"><div class="container-max"><p class="eyebrow">Work-life</p><h2 class="display mt-3 text-3xl">I work hard — and enjoy life</h2>
<div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{wl}</div>
<a href="/about#work-life" class="link-draw mt-8 inline-flex text-sm">Full lifestyle →</a></div></section>
<section class="section-pad border-t border-white/5"><div class="container-max glass-card flex flex-col md:flex-row md:items-center justify-between gap-8 p-10">
<div><h2 class="display text-3xl">Let’s talk infrastructure and AI</h2><p class="mt-3 text-white/55">Email, phone, LinkedIn — or download the resume.</p></div>
<a href="/contact" class="btn-primary magnetic" data-magnetic>Contact</a></div></section>
''', "/")

# ABOUT
wl_full = "".join(f'<article class="glass-card p-6" data-aos="fade-up"><h3 class="display text-xl">{t}</h3><p class="mt-3 text-sm text-white/55">{d}</p></article>' for t, d in WORKLIFE)
write("about.html", "About — John Kuan", "Biography, leadership philosophy, AI operating model, and work-life balance.",
      page_hero("About", "Enterprise judgment. AI leverage.", "Twenty-plus years closing and architecting enterprise technology outcomes — now paired with hands-on AI tooling that ships real systems.")
      + f'''
<section class="section-pad"><div class="container-max grid gap-12 lg:grid-cols-2">
  <div data-aos="fade-up"><p class="eyebrow">Biography</p><div class="mt-4 space-y-4 text-white/65"><p>Proven track record driving exceptional revenue growth and market expansion across VMware and Splunk (a Cisco company). As Regional Sales Manager for Rest of South Asia, I lead Malaysia’s telecom sector, major banks, fintech, and the Pakistan market — helping enterprises harness data for security, observability, and digital resilience.</p><p>At VMware I spearheaded the SDDC portfolio to 25%+ YoY growth and earned President’s Club twice. I lead multicultural teams, cultivate high-value partnerships, and act as a trusted advisor to C-level leaders navigating transformation.</p></div></div>
  <div class="space-y-6" data-aos="fade-up"><div class="glass-card p-6"><p class="eyebrow">Mission</p><p class="mt-3 text-white/65">Help enterprises modernize infrastructure with clarity — and use AI tools to compress the path from problem to production software.</p></div>
  <div class="glass-card p-6"><p class="eyebrow">Leadership philosophy</p><p class="mt-3 text-white/65">Outcomes over activity. Enable partners. Coach teams. Tell the truth about risk. Celebrate measurable wins.</p></div></div>
</div></section>
<section class="section-pad border-t border-white/5"><div class="container-max">
  <p class="eyebrow">AI operating model</p><h2 class="display mt-3 text-3xl md:text-4xl">Tool-driven problem solving</h2>
  <p class="mt-4 max-w-2xl text-white/55">Not “I use ChatGPT.” A disciplined loop: problem → tool choice → agent/workflow → outcome — applied to CloudiMesh, PropAI, CRM, and delivery copilots.</p>
  <div class="mt-10 grid gap-4 md:grid-cols-2">
    <div class="glass-card p-5"><p class="text-accent-cyan text-sm">Cursor + agents</p><p class="mt-2 text-sm text-white/55">Multi-file implementation with review gates.</p></div>
    <div class="glass-card p-5"><p class="text-accent-cyan text-sm">MCP</p><p class="mt-2 text-sm text-white/55">Ground agents in Cloudflare docs, browsers, and live systems.</p></div>
    <div class="glass-card p-5"><p class="text-accent-cyan text-sm">LLM APIs</p><p class="mt-2 text-sm text-white/55">In-product copilots for SOW and lead qualification.</p></div>
    <div class="glass-card p-5"><p class="text-accent-cyan text-sm">Judgment</p><p class="mt-2 text-sm text-white/55">Enterprise-grade outcomes — speed without sloppiness.</p></div>
  </div>
</div></section>
<section class="section-pad border-t border-white/5" id="work-life"><div class="container-max">
  <p class="eyebrow">Work-life balance</p><h2 class="display mt-3 text-3xl">Outside the boardroom</h2>
  <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{wl_full}</div>
</div></section>
<section class="section-pad border-t border-white/5"><div class="container-max grid gap-6 md:grid-cols-2">
  <div class="glass-card p-6"><p class="eyebrow">Education</p><ul class="mt-4 space-y-3 text-sm text-white/65"><li><strong class="text-white">MBA</strong> — National University of Malaysia, CGPA 3.94 (May 2024)</li><li><strong class="text-white">Bachelor’s</strong> — Computer Science / IT, University of Lincolnshire &amp; Humberside (1999)</li></ul></div>
  <div class="glass-card p-6"><p class="eyebrow">Languages</p><p class="mt-4 text-sm text-white/65">Excellent spoken and written English, Mandarin, Cantonese, and Bahasa.</p></div>
</div></section>
''', "/about")

# CAREER
items = []
for co, role, years, summary, highlights in CAREER:
    hs = "".join(f"<li>{h}</li>" for h in highlights)
    items.append(f'''
    <article class="relative pl-10" data-timeline-item data-aos="fade-up">
      <div class="absolute left-0 top-2 h-3 w-3 rounded-full bg-accent-cyan shadow-[0_0_12px_rgba(34,211,238,0.6)]"></div>
      <div class="glass-card p-6">
        <button type="button" class="flex w-full items-start justify-between gap-4 text-left" data-timeline-toggle aria-expanded="false">
          <div><p class="eyebrow">{co}</p><h3 class="display mt-1 text-xl">{role}</h3><p class="mt-1 text-sm text-white/45">{years}</p></div>
          <span data-chevron class="text-accent-cyan transition">▼</span>
        </button>
        <p class="mt-4 text-sm text-white/60">{summary}</p>
        <div data-timeline-panel class="overflow-hidden opacity-0 transition-all duration-300" style="max-height:0">
          <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-white/55">{hs}</ul>
        </div>
      </div>
    </article>''')
write("career.html", "Career — John Kuan", "Interactive career timeline from Microsoft trainer to Splunk ROSA and VMware Sales Director.",
      page_hero("Career", "Twenty-five years of enterprise technology", "From Microsoft Certified Trainer to VMware Sales Director ASEAN and Splunk Regional Sales Manager — expandable milestones below.")
      + f'<section class="section-pad"><div class="container-max relative before:absolute before:left-[5px] before:top-0 before:h-full before:w-px before:bg-gradient-to-b before:from-accent-cyan/50 before:to-transparent"><div class="space-y-6">{"".join(items)}</div></div></section>',
      "/career")

# SKILLS
bars = [
  ("Cloud & Hybrid", 95), ("VMware / Private Cloud", 96), ("Networking & Security (NSX)", 92),
  ("AI Agents & Tooling", 88), ("Enterprise Sales Leadership", 95), ("Automation (Terraform/Ansible/Aria)", 82),
  ("Observability (Splunk)", 85), ("Programming (Laravel/PHP/Python)", 78),
]
bar_html = "".join(f'<div class="mb-5"><div class="mb-2 flex justify-between text-sm"><span>{n}</span><span class="text-white/40">{v}%</span></div><div class="progress-track"><div class="progress-bar" data-value="{v}"></div></div></div>' for n, v in bars)
certs = ["MCSE", "MCDBA", "Microsoft Certified Trainer", "VMware Certified Professional", "PRINCE2 Fundamental", "ITILv2", "MY5G Ericsson Pioneers", "ML & AI Fundamentals (Codecademy)"]
cert_html = "".join(f'<div class="glass-card flex min-h-[120px] items-center justify-center p-4 text-center text-sm font-medium" data-aos="fade-up">{c}</div>' for c in certs)
write("skills.html", "Skills — John Kuan", "Radar charts, progress bars, certifications, and technology network graph.",
      page_hero("Skills", "Depth across cloud, AI, and leadership", "AI & tooling is a first-class axis — alongside architecture, sales, and infrastructure.")
      + f'''
<section class="section-pad"><div class="container-max grid gap-12 lg:grid-cols-2">
  <div data-aos="fade-up"><p class="eyebrow mb-4">Radar</p>
  <div id="skills-radar" data-labels='["Cloud","Infra","Automation","Programming","Leadership","Sales","AI","Architecture"]' data-values='[94,93,84,78,95,96,88,92]'></div></div>
  <div data-aos="fade-up"><p class="eyebrow mb-4">Proficiency</p>{bar_html}</div>
</div></section>
<section class="section-pad border-t border-white/5"><div class="container-max">
  <p class="eyebrow">Technology network</p><h2 class="display mt-3 text-3xl">How the stack connects</h2>
  <div id="tech-graph" class="mt-8 glass-card p-4" data-aos="fade-up"></div>
</div></section>
<section class="section-pad border-t border-white/5"><div class="container-max">
  <p class="eyebrow">Certifications</p><h2 class="display mt-3 text-3xl">Credential wall</h2>
  <p class="mt-3 text-sm text-white/45">CV-backed credentials first.</p>
  <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cert_html}</div>
</div></section>
''', "/skills")

# PROJECTS INDEX
write("projects.html", "Projects — John Kuan", "AI-built and enterprise projects with dedicated case studies.",
      page_hero("Projects", "Shipped systems, not slideware", "Each card opens a full case study: what it does, architecture, AI tools, and screenshots.")
      + '''
<section class="section-pad pt-0"><div class="container-max">
  <div class="mb-8 flex flex-wrap gap-2">
    <button type="button" data-filter="All" class="chip bg-white/10">All</button>
    <button type="button" data-filter="AI-built" class="chip">AI-built</button>
    <button type="button" data-filter="Enterprise" class="chip">Enterprise</button>
    <button type="button" data-filter="Edge" class="chip">Edge</button>
    <button type="button" data-filter="Product" class="chip">Product</button>
    <button type="button" data-filter="Sales" class="chip">Sales</button>
  </div>
  <div id="projects-grid" class="grid gap-6 md:grid-cols-2"></div>
</div></section>
''', "/projects")

# PROJECT DETAIL PAGES
for i, p in enumerate(PROJECTS):
    d = DETAILS[p["slug"]]
    shots = []
    for n in range(1, 5):
        fname = "01-overview.svg" if n == 1 else f"0{n}-screen.svg"
        cap = ["Overview", "Primary workflow", "Operations view", "Detail panel"][n - 1]
        shots.append(f'''<button type="button" class="glass-card overflow-hidden p-0 text-left" data-full="/assets/projects/{p["slug"]}/{fname}" data-caption="{cap}">
          <img src="/assets/projects/{p["slug"]}/{fname}" alt="{p["title"]} — {cap}" class="aspect-video w-full object-cover" loading="lazy" width="640" height="360"/>
          <p class="p-3 text-xs text-white/50">{cap}</p></button>''')
    prev_p = PROJECTS[i - 1]
    next_p = PROJECTS[(i + 1) % len(PROJECTS)]
    how = "".join(f"<li>{h}</li>" for h in d["how"])
    tools = "".join(f'<span class="chip">{t}</span>' for t in p["aiTools"])
    stack = "".join(f'<span class="chip">{t}</span>' for t in p["stack"])
    tags = "".join(f'<span class="chip">{t}</span>' for t in p["tags"])
    demo = f'<a href="{p["demo"]}" class="btn-ghost" target="_blank" rel="noopener">Demo</a>' if p.get("demo") else ""
    write(f"projects/{p['slug']}.html", f"{p['title']} — Project Case Study", p["pitch"],
          f'''
<section class="section-pad border-b border-white/5"><div class="container-max">
  <a href="/projects" class="link-draw text-sm">← All projects</a>
  <div class="mt-6 flex flex-wrap gap-2">{tags}</div>
  <h1 class="display mt-4 text-4xl md:text-6xl">{p["title"]}</h1>
  <p class="mt-4 max-w-2xl text-lg text-white/55">{p["pitch"]}</p>
  <div class="mt-8 flex flex-wrap gap-3">
    <a href="{p["github"]}" class="btn-primary" target="_blank" rel="noopener">GitHub</a>{demo}
  </div>
</div></section>
<section class="section-pad"><div class="container-max grid gap-12 lg:grid-cols-2">
  <div><p class="eyebrow">What it does</p><p class="mt-4 text-white/65">{d["what"]}</p>
  <p class="mt-6 text-sm text-accent-cyan/80">Problem solved</p><p class="mt-2 text-white/55">{p["problemSolved"]}</p></div>
  <div><p class="eyebrow">How it works</p><ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-white/55">{how}</ul>
  <p class="mt-8 eyebrow">AI &amp; tools</p><div class="mt-3 flex flex-wrap gap-2">{tools}</div>
  <p class="mt-8 eyebrow">Stack</p><div class="mt-3 flex flex-wrap gap-2">{stack}</div></div>
</div></section>
<section class="section-pad border-t border-white/5"><div class="container-max">
  <p class="eyebrow">Screenshots</p><h2 class="display mt-3 text-3xl">Product frames</h2>
  <p class="mt-2 text-sm text-white/40">Labeled UI frames — replace with live captures anytime.</p>
  <div id="project-gallery" class="mt-8 grid gap-4 sm:grid-cols-2">{"".join(shots)}</div>
</div></section>
<section class="section-pad border-t border-white/5"><div class="container-max flex flex-wrap justify-between gap-4">
  <a class="link-draw" href="/projects/{prev_p["slug"]}">← {prev_p["title"]}</a>
  <a class="link-draw" href="/projects/{next_p["slug"]}">{next_p["title"]} →</a>
</div></section>
''', f"/projects/{p['slug']}")

# KNOWLEDGE
write("knowledge.html", "Knowledge — John Kuan", "Searchable knowledge library across AI, VMware, cloud, and architecture.",
      page_hero("Knowledge", "A searchable library — not a buzzword list", "AI, Agents, MCP, and Cursor sit alongside VMware, cloud, and security.")
      + '''
<section class="section-pad pt-0"><div class="container-max">
  <input id="knowledge-search" type="search" placeholder="Search knowledge…" class="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm outline-none focus:border-accent-cyan/40" />
  <div id="knowledge-cats" class="mt-6 flex flex-wrap gap-2"></div>
  <div id="knowledge-root" class="mt-10 grid gap-4 md:grid-cols-2"></div>
</div></section>
''', "/knowledge")

# BLOG
write("blog.html", "Blog — John Kuan", "Essays on AI tooling, VMware delivery, and enterprise infrastructure.",
      page_hero("Blog", "Notes from the field", "AI problem-solving workflows and enterprise infrastructure lessons.")
      + '''
<section class="section-pad pt-0"><div class="container-max">
  <input id="blog-search" type="search" placeholder="Search posts…" class="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm outline-none focus:border-accent-cyan/40" />
  <div id="blog-tags" class="mt-6 flex flex-wrap gap-2"></div>
  <div id="blog-grid" class="mt-10 grid gap-4 md:grid-cols-2"></div>
</div></section>
''', "/blog")

for slug, title in [
  ("cursor-mcp-delivery", "Cursor + MCP Delivery"),
  ("ai-sow-copilots", "AI SOW Copilots"),
  ("agentic-crm-qualification", "Agentic CRM Qualification"),
  ("enterprise-networking-asean", "Enterprise Networking ASEAN"),
]:
    write(f"blog/{slug}.html", f"{title} — Blog", title,
          f'''
<section class="section-pad"><div class="container-max max-w-3xl">
  <a href="/blog" class="link-draw text-sm">← Blog</a>
  <article id="blog-article" data-slug="{slug}" class="prose prose-invert mt-8 max-w-none space-y-4 text-white/70 [&_h1]:display [&_h1]:text-4xl [&_h1]:text-white [&_h2]:display [&_h2]:text-2xl [&_h2]:text-white [&_h3]:text-white"></article>
</div></section>
''', f"/blog/{slug}")

# GALLERY
gal = "".join(f'''<button type="button" class="glass-card overflow-hidden p-0" data-full="/assets/gallery/{i:02d}.svg" data-caption="{label}">
  <img src="/assets/gallery/{i:02d}.svg" alt="{label}" class="aspect-[4/3] w-full object-cover" loading="lazy"/>
  <p class="p-3 text-left text-xs text-white/50">{label}</p></button>''' for i, label in enumerate(
    ["Conference", "Home lab", "Architecture diagram", "Diving", "Golf", "Hiking", "Team", "Speaking"], 1))
write("gallery.html", "Gallery — John Kuan", "Professional, conference, travel, lab, and lifestyle gallery.",
      page_hero("Gallery", "Work, stage, and life", "Placeholders for conferences, home lab, diagrams, and outdoor pursuits — swap in real photos anytime.")
      + f'<section class="section-pad pt-0"><div class="container-max"><div id="project-gallery" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{gal}</div></div></section>',
      "/gallery")

# CONTACT
write("contact.html", "Contact — John Kuan", "Email, phone, LinkedIn, GitHub, and resume download.",
      page_hero("Contact", "Let’s connect", "No forms — reach out directly. Optional visitor profile on first visit helps personalize return trips.")
      + '''
<section class="section-pad pt-0"><div class="container-max grid gap-6 md:grid-cols-2">
  <div class="glass-card p-8"><p class="eyebrow">Email</p><a class="display mt-3 block text-2xl link-draw" href="mailto:kuan.john@gmail.com">kuan.john@gmail.com</a>
  <button type="button" class="btn-ghost mt-6" data-copy="kuan.john@gmail.com">Copy email</button></div>
  <div class="glass-card p-8"><p class="eyebrow">Phone</p><a class="display mt-3 block text-2xl link-draw" href="tel:+60123071780">+60 12-307 1780</a>
  <button type="button" class="btn-ghost mt-6" data-copy="+60123071780">Copy phone</button></div>
  <a class="glass-card block p-8" href="https://www.linkedin.com/in/kuanjohn/" target="_blank" rel="noopener"><p class="eyebrow">LinkedIn</p><p class="display mt-3 text-2xl">kuanjohn →</p></a>
  <a class="glass-card block p-8" href="https://github.com/kuanjohn" target="_blank" rel="noopener"><p class="eyebrow">GitHub</p><p class="display mt-3 text-2xl">kuanjohn →</p></a>
  <a class="glass-card block p-8 md:col-span-2" href="/assets/resume/John-Kuan-CV.pdf" download><p class="eyebrow">Resume</p><p class="display mt-3 text-2xl">Download PDF →</p></a>
  <div class="glass-card flex min-h-[220px] items-center justify-center p-8 md:col-span-2"><div class="text-center"><p class="eyebrow">Map</p><p class="mt-3 text-white/45">Kuala Lumpur / ASEAN — map placeholder</p></div></div>
</div></section>
''', "/contact")

# 404
write("404.html", "Not found — John Kuan", "Page not found.",
      '''<section class="section-pad min-h-[70vh] flex items-center"><div class="container-max text-center">
  <p class="eyebrow">404</p><h1 class="display mt-4 text-5xl">This page drifted offline</h1>
  <p class="mt-4 text-white/55">Try the command palette (⌘K) or head home.</p>
  <a href="/" class="btn-primary mt-8 inline-flex">Home</a></div></section>''', "/404")

print("All pages generated.")
