export async function initProjects() {
  const grid = document.getElementById("projects-grid");
  if (grid) {
    const res = await fetch("/data/projects.json");
    const projects = await res.json();
    const filters = document.querySelectorAll("[data-filter]");
    let active = "All";

    function paint() {
      const list = projects.filter((p) => active === "All" || p.tags.includes(active));
      grid.innerHTML = list
        .map(
          (p) => `
        <a href="/projects/${p.slug}" class="glass-card group block overflow-hidden p-0" data-aos="fade-up">
          <div class="relative aspect-[16/10] overflow-hidden bg-ink-100">
            <img src="/assets/projects/${p.slug}/01-overview.svg" alt="${p.title} overview" class="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" width="640" height="400" />
            <div class="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80"></div>
            <div class="absolute bottom-4 left-4 flex flex-wrap gap-2">${p.tags.map((t) => `<span class="chip">${t}</span>`).join("")}</div>
          </div>
          <div class="p-6">
            <h3 class="display text-xl">${p.title}</h3>
            <p class="mt-2 text-sm text-white/60">${p.pitch}</p>
            <p class="mt-4 text-xs text-accent-cyan/80">Problem → tools → outcome</p>
            <p class="mt-1 text-sm text-white/50">${p.problemSolved}</p>
            <span class="mt-5 inline-flex items-center gap-2 text-sm text-white link-draw">Open case study <span aria-hidden="true">→</span></span>
          </div>
        </a>`
        )
        .join("");
    }

    filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        active = btn.dataset.filter;
        filters.forEach((b) => b.classList.toggle("bg-white/10", b === btn));
        paint();
      });
    });
    paint();
  }

  const gallery = document.getElementById("project-gallery");
  if (gallery) {
    let lb = document.getElementById("lightbox");
    if (!lb) {
      lb = document.createElement("div");
      lb.id = "lightbox";
      lb.className = "lightbox";
      lb.innerHTML = `<button type="button" class="absolute right-4 top-4 btn-ghost" id="lb-close">Close</button><img id="lb-img" class="max-h-[85vh] max-w-[92vw] rounded-xl" alt="" />`;
      document.body.appendChild(lb);
      lb.addEventListener("click", (e) => {
        if (e.target === lb || e.target.id === "lb-close") lb.classList.remove("open");
      });
    }
    gallery.querySelectorAll("button[data-full]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.getElementById("lb-img").src = btn.dataset.full;
        document.getElementById("lb-img").alt = btn.dataset.caption || "";
        lb.classList.add("open");
      });
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") lb.classList.remove("open");
    });
  }
}
