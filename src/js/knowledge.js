export async function initKnowledge() {
  const root = document.getElementById("knowledge-root");
  if (!root) return;
  const res = await fetch("/data/knowledge.json");
  const data = await res.json();
  const search = document.getElementById("knowledge-search");
  const cats = document.getElementById("knowledge-cats");
  let active = "All";

  const categories = ["All", ...new Set(data.map((d) => d.category))];

  function renderCats() {
    cats.innerHTML = categories
      .map(
        (c) =>
          `<button type="button" data-cat="${c}" class="chip transition hover:border-accent-cyan/40 ${c === active ? "!border-accent-cyan/50 !bg-accent-cyan/10" : ""}">${c}</button>`
      )
      .join("");
    cats.querySelectorAll("[data-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        active = btn.dataset.cat;
        renderCats();
        paint();
      });
    });
  }

  function paint() {
    const q = (search?.value || "").toLowerCase();
    const list = data.filter((d) => {
      const catOk = active === "All" || d.category === active;
      const qOk =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.tags.join(" ").toLowerCase().includes(q);
      return catOk && qOk;
    });
    root.innerHTML = list
      .map(
        (d) => `
      <article class="glass-card p-6" data-aos="fade-up">
        <p class="eyebrow">${d.category}</p>
        <h3 class="display mt-2 text-xl">${d.title}</h3>
        <p class="mt-3 text-sm text-white/60">${d.summary}</p>
        <div class="mt-4 flex flex-wrap gap-2">${d.tags.map((t) => `<span class="chip">${t}</span>`).join("")}</div>
      </article>`
      )
      .join("");
  }

  search?.addEventListener("input", paint);
  renderCats();
  paint();
}
