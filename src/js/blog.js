function mdToHtml(md) {
  // Strip frontmatter-ish meta lines
  const body = md
    .split("\n")
    .filter((l) => !/^(tags|date|summary):/.test(l))
    .join("\n");
  if (typeof marked !== "undefined") return marked.parse(body);
  return body
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(.*)$/, "<p>$1</p>");
}

export async function initBlog() {
  const grid = document.getElementById("blog-grid");
  if (grid) {
    const posts = await (await fetch("/data/blog.json")).json();
    const search = document.getElementById("blog-search");
    const tagBox = document.getElementById("blog-tags");
    let tag = "All";
    const allTags = ["All", ...new Set(posts.flatMap((p) => p.tags))];

    function renderTags() {
      if (!tagBox) return;
      tagBox.innerHTML = allTags
        .map((t) => `<button type="button" data-tag="${t}" class="chip ${t === tag ? "!border-accent-cyan/50 !bg-accent-cyan/10" : ""}">${t}</button>`)
        .join("");
      tagBox.querySelectorAll("[data-tag]").forEach((b) =>
        b.addEventListener("click", () => {
          tag = b.dataset.tag;
          renderTags();
          paint();
        })
      );
    }

    function paint() {
      const q = (search?.value || "").toLowerCase();
      const list = posts.filter((p) => {
        const tOk = tag === "All" || p.tags.includes(tag);
        const qOk = !q || p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q);
        return tOk && qOk;
      });
      grid.innerHTML = list
        .map(
          (p) => `
        <a href="/blog/${p.slug}" class="glass-card block p-6" data-aos="fade-up">
          <div class="flex items-center justify-between gap-3 text-xs text-white/40">
            <span>${p.date}</span>
            <span>${p.readingTime} min read</span>
          </div>
          <h3 class="display mt-3 text-xl">${p.title}</h3>
          <p class="mt-2 text-sm text-white/60">${p.summary}</p>
          <div class="mt-4 flex flex-wrap gap-2">${p.tags.map((t) => `<span class="chip">${t}</span>`).join("")}</div>
        </a>`
        )
        .join("");
    }
    search?.addEventListener("input", paint);
    renderTags();
    paint();
  }

  const article = document.getElementById("blog-article");
  if (article) {
    const slug = article.dataset.slug;
    const md = await (await fetch(`/blog/${slug}.md`)).text();
    article.innerHTML = mdToHtml(md);
  }
}
