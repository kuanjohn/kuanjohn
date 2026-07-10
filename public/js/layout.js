/**
 * Shared layout: nav, footer, progress, back-to-top, mobile menu
 */
const NAV = [
  { href: "/about", label: "About" },
  { href: "/career", label: "Career" },
  { href: "/skills", label: "Skills" },
  { href: "/projects", label: "Projects" },
  { href: "/knowledge", label: "Knowledge" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

function pathMatch(href) {
  const p = location.pathname.replace(/\/$/, "") || "/";
  const h = href.replace(/\/$/, "") || "/";
  if (h === "/") return p === "/" || p.endsWith("/index.html");
  return p === h || p.startsWith(h + "/") || p.endsWith(h + ".html");
}

export function mountLayout() {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  if (header) {
    header.innerHTML = `
      <div class="container-max flex items-center justify-between gap-4 py-4">
        <a href="/" class="display text-lg tracking-tight text-white magnetic" data-magnetic>John Kuan</a>
        <nav class="hidden items-center gap-6 lg:flex" aria-label="Primary">
          ${NAV.map((n) => `<a class="nav-link magnetic ${pathMatch(n.href) ? "text-white" : ""}" href="${n.href}" data-magnetic>${n.label}</a>`).join("")}
        </nav>
        <div class="flex items-center gap-2">
          <button type="button" id="theme-toggle" class="btn-ghost !px-3 !py-2 text-xs" aria-label="Toggle theme">Theme</button>
          <button type="button" id="cmdk-open" class="btn-ghost !px-3 !py-2 text-xs hidden sm:inline-flex" aria-label="Open command palette">⌘K</button>
          <button type="button" id="nav-toggle" class="btn-ghost !px-3 !py-2 lg:hidden" aria-label="Open menu">Menu</button>
        </div>
      </div>
      <div id="mobile-nav" class="hidden border-t border-white/10 lg:hidden">
        <div class="container-max flex flex-col gap-3 py-4">
          ${NAV.map((n) => `<a class="link-draw text-base" href="${n.href}">${n.label}</a>`).join("")}
        </div>
      </div>`;
  }
  if (footer) {
    footer.innerHTML = `
      <div class="container-max grid gap-10 border-t border-white/10 py-14 md:grid-cols-3">
        <div>
          <p class="display text-xl">John Kuan</p>
          <p class="mt-3 max-w-sm text-sm text-white/55">Enterprise technology leader and AI-native builder. Trusted with multimillion-dollar infrastructure outcomes.</p>
        </div>
        <div>
          <p class="eyebrow">Navigate</p>
          <div class="mt-4 flex flex-col gap-2">
            ${NAV.map((n) => `<a class="link-draw text-sm" href="${n.href}">${n.label}</a>`).join("")}
          </div>
        </div>
        <div>
          <p class="eyebrow">Connect</p>
          <div class="mt-4 flex flex-col gap-2 text-sm">
            <a class="link-draw" href="mailto:kuan.john@gmail.com">kuan.john@gmail.com</a>
            <a class="link-draw" href="https://www.linkedin.com/in/kuanjohn/" target="_blank" rel="noopener">LinkedIn</a>
            <a class="link-draw" href="https://github.com/kuanjohn" target="_blank" rel="noopener">GitHub</a>
            <button type="button" id="visitor-edit" class="link-draw text-left text-white/55">Update visitor profile</button>
          </div>
        </div>
      </div>
      <div class="container-max flex flex-wrap items-center justify-between gap-3 border-t border-white/5 py-6 text-xs text-white/40">
        <span>© ${new Date().getFullYear()} John Kuan. All rights reserved.</span>
        <span>Built for Cloudflare Workers · Press ⌘K</span>
      </div>`;
  }

  document.getElementById("nav-toggle")?.addEventListener("click", () => {
    document.getElementById("mobile-nav")?.classList.toggle("hidden");
  });

  const progress = document.getElementById("progress-bar");
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    if (progress) progress.style.width = pct + "%";
    const top = document.getElementById("back-to-top");
    if (top) top.classList.toggle("opacity-100", h.scrollTop > 600);
    if (top) top.classList.toggle("pointer-events-auto", h.scrollTop > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  document.getElementById("back-to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
