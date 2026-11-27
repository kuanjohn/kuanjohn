/**
 * Travel journal: EN / 中文 / both language toggle + a public (ungated) photo lightbox.
 * The initial language is set by an inline script in the page (no flash); this
 * module wires the toggle buttons and remembers the choice.
 */
const KEY = "jk-journal-lang";
const LANGS = ["en", "zh", "both"];

function currentLang() {
  const l = document.documentElement.getAttribute("data-jlang");
  return LANGS.includes(l) ? l : "en";
}

function setLang(lang) {
  if (!LANGS.includes(lang)) return;
  document.documentElement.setAttribute("data-jlang", lang);
  try {
    localStorage.setItem(KEY, lang);
  } catch {}
  syncButtons();
}

function syncButtons() {
  const lang = currentLang();
  document.querySelectorAll("[data-jlang-set]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.jlangSet === lang));
  });
}

function initLightbox(gallery) {
  const buttons = Array.from(gallery.querySelectorAll("button[data-full]"));
  if (!buttons.length) return;

  const lb = document.createElement("div");
  lb.className = "lightbox journal-lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.innerHTML = `
    <button type="button" class="absolute right-4 top-4 btn-ghost" data-lb-close>Close · 关闭</button>
    <button type="button" class="lb-nav lb-prev" data-lb-prev aria-label="Previous">&#8592;</button>
    <button type="button" class="lb-nav lb-next" data-lb-next aria-label="Next">&#8594;</button>
    <figure class="flex max-h-[90vh] max-w-[94vw] flex-col items-center gap-3">
      <img class="max-h-[80vh] max-w-[94vw] rounded-xl" alt="" data-lb-img />
      <figcaption class="max-w-xl text-center text-sm text-fg/70">
        <span class="jl-en" lang="en" data-lb-en></span><span class="jl-zh" lang="zh-Hans" data-lb-zh></span>
      </figcaption>
      <span class="text-xs text-fg/40" data-lb-count></span>
    </figure>`;
  document.body.appendChild(lb);

  const img = lb.querySelector("[data-lb-img]");
  const en = lb.querySelector("[data-lb-en]");
  const zh = lb.querySelector("[data-lb-zh]");
  const count = lb.querySelector("[data-lb-count]");
  const multi = buttons.length > 1;
  lb.querySelector("[data-lb-prev]").style.display = multi ? "" : "none";
  lb.querySelector("[data-lb-next]").style.display = multi ? "" : "none";
  let i = 0;

  const show = (n) => {
    i = (n + buttons.length) % buttons.length;
    const b = buttons[i];
    img.src = b.dataset.full;
    img.alt = b.dataset.capEn || b.getAttribute("aria-label") || "";
    en.textContent = b.dataset.capEn || "";
    zh.textContent = b.dataset.capZh || "";
    count.textContent = multi ? `${i + 1} / ${buttons.length}` : "";
  };
  const close = () => {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  };

  buttons.forEach((b, n) =>
    b.addEventListener("click", () => {
      show(n);
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    })
  );
  lb.addEventListener("click", (e) => {
    if (e.target === lb || e.target.closest("[data-lb-close]")) close();
  });
  lb.querySelector("[data-lb-prev]").addEventListener("click", (e) => {
    e.stopPropagation();
    show(i - 1);
  });
  lb.querySelector("[data-lb-next]").addEventListener("click", (e) => {
    e.stopPropagation();
    show(i + 1);
  });
  window.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(i - 1);
    else if (e.key === "ArrowRight") show(i + 1);
  });

  // Swipe on touch screens.
  let x0 = null;
  lb.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(dx < 0 ? i + 1 : i - 1);
    x0 = null;
  });
}

export function initJournal() {
  const toggles = document.querySelectorAll("[data-jlang-set]");
  if (!toggles.length) return;
  toggles.forEach((b) => b.addEventListener("click", () => setLang(b.dataset.jlangSet)));
  syncButtons();
  const gallery = document.getElementById("journal-gallery");
  if (gallery) initLightbox(gallery);
}
