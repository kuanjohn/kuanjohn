import { isContactUnlocked } from "./visitor.js";

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
            <img src="${p.thumb || `/assets/projects/${p.slug}/01-overview.svg`}" alt="${p.title} overview" class="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" width="640" height="400" />
            <div class="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80"></div>
            <div class="absolute bottom-4 left-4 flex flex-wrap gap-2">${p.tags.map((t) => `<span class="chip">${t}</span>`).join("")}</div>
          </div>
          <div class="p-6">
            <h3 class="display text-xl">${p.title}</h3>
            <p class="mt-2 text-sm text-fg/60">${p.pitch}</p>
            <p class="mt-4 text-xs text-accent-cyan/80">Problem → tools → outcome</p>
            <p class="mt-1 text-sm text-fg/50">${p.problemSolved}</p>
            <span class="mt-5 inline-flex items-center gap-2 text-sm text-fg link-draw">Open case study <span aria-hidden="true">→</span></span>
          </div>
        </a>`
        )
        .join("");
    }

    filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        active = btn.dataset.filter;
        filters.forEach((b) => b.classList.toggle("bg-surface/10", b === btn));
        paint();
      });
    });
    paint();
  }

  const gallery = document.getElementById("project-gallery");
  if (gallery) {
    const frames = Array.from(gallery.querySelectorAll("button[data-full]")).map((btn) => ({
      src: btn.dataset.full,
      caption: btn.dataset.caption || "",
    }));

    let lb = document.getElementById("lightbox");
    if (!lb) {
      lb = document.createElement("div");
      lb.id = "lightbox";
      lb.className = "lightbox";
      lb.innerHTML = `
        <button type="button" class="absolute right-4 top-4 btn-ghost" id="lb-close">Close</button>
        <button type="button" class="lb-nav lb-prev" id="lb-prev" aria-label="Previous">&#8592;</button>
        <button type="button" class="lb-nav lb-next" id="lb-next" aria-label="Next">&#8594;</button>
        <figure class="flex max-h-[90vh] max-w-[92vw] flex-col items-center gap-3">
          <img id="lb-img" class="max-h-[80vh] max-w-[92vw] rounded-xl" alt="" />
          <figcaption id="lb-caption" class="text-center text-sm text-fg/60"></figcaption>
          <span id="lb-count" class="text-xs text-fg/40"></span>
        </figure>`;
      document.body.appendChild(lb);
    }

    const lbImg = lb.querySelector("#lb-img");
    const lbCaption = lb.querySelector("#lb-caption");
    const lbCount = lb.querySelector("#lb-count");
    const lbPrev = lb.querySelector("#lb-prev");
    const lbNext = lb.querySelector("#lb-next");
    let current = 0;

    function show(index) {
      if (!frames.length) return;
      current = (index + frames.length) % frames.length;
      const frame = frames[current];
      lbImg.src = frame.src;
      lbImg.alt = frame.caption;
      lbCaption.textContent = frame.caption;
      lbCount.textContent = frames.length > 1 ? `${current + 1} / ${frames.length}` : "";
      const multi = frames.length > 1;
      lbPrev.style.display = multi ? "" : "none";
      lbNext.style.display = multi ? "" : "none";
    }

    function open(index) {
      // Photos are gated behind the visitor unlock, same as contact details.
      if (!isContactUnlocked()) {
        document.dispatchEvent(new CustomEvent("jk:visitor-edit"));
        return;
      }
      show(index);
      lb.classList.add("open");
    }

    function close() {
      lb.classList.remove("open");
    }

    lb.addEventListener("click", (e) => {
      if (e.target === lb || e.target.id === "lb-close") close();
    });
    lbPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      show(current - 1);
    });
    lbNext.addEventListener("click", (e) => {
      e.stopPropagation();
      show(current + 1);
    });

    gallery.querySelectorAll("button[data-full]").forEach((btn, i) => {
      btn.addEventListener("click", () => open(i));
    });

    window.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(current - 1);
      else if (e.key === "ArrowRight") show(current + 1);
    });
  }
}
