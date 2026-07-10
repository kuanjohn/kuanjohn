const PAGES = [
  { title: "Home", href: "/", keywords: "home john" },
  { title: "About", href: "/about", keywords: "bio mission ai philosophy" },
  { title: "Career", href: "/career", keywords: "timeline vmware splunk hp" },
  { title: "Skills", href: "/skills", keywords: "radar cloud ai certifications" },
  { title: "Projects", href: "/projects", keywords: "cloudimesh propai crm" },
  { title: "Knowledge", href: "/knowledge", keywords: "library vmware mcp cursor" },
  { title: "Blog", href: "/blog", keywords: "articles posts" },
  { title: "Gallery", href: "/gallery", keywords: "photos lab" },
  { title: "Contact", href: "/contact", keywords: "email phone linkedin resume" },
  { title: "Update visitor profile", href: "#visitor", keywords: "name email remember" },
  { title: "Toggle theme", href: "#theme", keywords: "dark light" },
];

export function initCommandPalette() {
  if (!document.getElementById("cmdk")) {
    const el = document.createElement("div");
    el.id = "cmdk";
    el.className = "cmdk";
    el.innerHTML = `
      <div class="glass w-full max-w-lg overflow-hidden rounded-2xl">
        <input id="cmdk-input" type="search" placeholder="Search pages, actions…" class="w-full border-b border-white/10 bg-transparent px-5 py-4 text-sm outline-none" />
        <ul id="cmdk-list" class="max-h-72 overflow-auto p-2"></ul>
        <p class="border-t border-white/10 px-4 py-2 text-xs text-white/35">↑↓ navigate · Enter open · Esc close</p>
      </div>`;
    document.body.appendChild(el);
  }

  const root = document.getElementById("cmdk");
  const input = document.getElementById("cmdk-input");
  const list = document.getElementById("cmdk-list");
  let active = 0;
  let filtered = PAGES;

  function render() {
    const q = (input.value || "").toLowerCase().trim();
    filtered = PAGES.filter((p) => !q || p.title.toLowerCase().includes(q) || p.keywords.includes(q));
    active = 0;
    list.innerHTML = filtered
      .map(
        (p, i) =>
          `<li><button type="button" data-i="${i}" class="cmdk-item flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm ${i === active ? "bg-white/10" : "hover:bg-white/5"}"><span>${p.title}</span><span class="text-xs text-white/35">${p.href}</span></button></li>`
      )
      .join("") || `<li class="px-3 py-4 text-sm text-white/40">No results</li>`;
    list.querySelectorAll(".cmdk-item").forEach((btn) => {
      btn.addEventListener("click", () => run(Number(btn.dataset.i)));
    });
  }

  function run(i) {
    const item = filtered[i];
    if (!item) return;
    close();
    if (item.href === "#visitor") {
      document.dispatchEvent(new CustomEvent("jk:visitor-edit"));
      return;
    }
    if (item.href === "#theme") {
      document.getElementById("theme-toggle")?.click();
      return;
    }
    location.href = item.href;
  }

  function open() {
    root.classList.add("open");
    input.value = "";
    render();
    input.focus();
  }
  function close() {
    root.classList.remove("open");
  }

  document.getElementById("cmdk-open")?.addEventListener("click", open);
  root.addEventListener("click", (e) => {
    if (e.target === root) close();
  });
  input.addEventListener("input", render);
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      root.classList.contains("open") ? close() : open();
    }
    if (!root.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      active = Math.min(filtered.length - 1, active + 1);
      render();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      active = Math.max(0, active - 1);
      render();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      run(active);
    }
  });
}
