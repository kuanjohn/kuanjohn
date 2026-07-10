const STORAGE = "jk_visitor";
const COOKIE = "jk_visitor";

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : "v-" + Math.random().toString(36).slice(2) + Date.now();
}

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE) || "null");
  } catch {
    return null;
  }
}

function writeLocal(data) {
  localStorage.setItem(STORAGE, JSON.stringify(data));
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify({ id: data.id, name: data.name || "" }))}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

async function persist(data) {
  try {
    await fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: data.id,
        name: data.name || "",
        email: data.email || "",
        website: "", // honeypot
      }),
    });
  } catch {
    /* offline / local — client remember still works */
  }
}

function showWelcomeBack(data) {
  if (!data?.name) return;
  const el = document.getElementById("welcome-back");
  if (!el) return;
  el.textContent = `Welcome back, ${data.name}`;
  el.classList.remove("opacity-0");
  setTimeout(() => el.classList.add("opacity-0"), 4000);
}

function openModal(force = false) {
  const modal = document.getElementById("visitor-modal");
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  if (force) {
    const data = readLocal();
    if (data) {
      const name = document.getElementById("visitor-name");
      const email = document.getElementById("visitor-email");
      if (name) name.value = data.name || "";
      if (email) email.value = data.email || "";
    }
  }
}

function closeModal() {
  const modal = document.getElementById("visitor-modal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

export function initVisitor() {
  // Ensure modal markup exists
  if (!document.getElementById("visitor-modal")) {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div id="visitor-modal" class="visitor-modal" aria-hidden="true" role="dialog" aria-labelledby="visitor-title">
        <div class="glass max-w-md w-full rounded-2xl p-8">
          <p class="eyebrow">Welcome</p>
          <h2 id="visitor-title" class="display mt-2 text-2xl">Optional introduction</h2>
          <p class="mt-3 text-sm text-white/60">Share your name and email if you’d like — so the next visit feels personal. You can skip anytime.</p>
          <form id="visitor-form" class="mt-6 space-y-4">
            <input type="text" name="website" class="hidden" tabindex="-1" autocomplete="off" aria-hidden="true" />
            <div>
              <label class="text-xs text-white/50" for="visitor-name">Name</label>
              <input id="visitor-name" name="name" type="text" class="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-accent-cyan/50" placeholder="Optional" />
            </div>
            <div>
              <label class="text-xs text-white/50" for="visitor-email">Email</label>
              <input id="visitor-email" name="email" type="email" class="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-accent-cyan/50" placeholder="Optional" />
            </div>
            <div class="flex flex-wrap gap-3 pt-2">
              <button type="submit" class="btn-primary">Continue</button>
              <button type="button" id="visitor-skip" class="btn-ghost">Skip for now</button>
            </div>
            <p class="text-xs text-white/35">Stored locally and optionally on Cloudflare KV for visit counts. No marketing spam.</p>
          </form>
        </div>
      </div>
      <div id="welcome-back" class="pointer-events-none fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-accent-cyan/30 bg-ink-50/90 px-4 py-2 text-sm text-white opacity-0 transition-opacity duration-500"></div>`;
    document.body.appendChild(wrap);
  }

  const existing = readLocal();
  if (existing?.seenAt) {
    showWelcomeBack(existing);
    // ping visit count
    persist(existing);
  } else {
    setTimeout(() => openModal(false), 1500);
  }

  document.getElementById("visitor-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (fd.get("website")) {
      closeModal();
      return;
    }
    const data = {
      id: existing?.id || uuid(),
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      seenAt: new Date().toISOString(),
    };
    writeLocal(data);
    await persist(data);
    closeModal();
    showWelcomeBack(data);
  });

  document.getElementById("visitor-skip")?.addEventListener("click", async () => {
    const data = {
      id: existing?.id || uuid(),
      name: "",
      email: "",
      seenAt: new Date().toISOString(),
    };
    writeLocal(data);
    await persist(data);
    closeModal();
  });

  document.getElementById("visitor-edit")?.addEventListener("click", () => openModal(true));
  document.addEventListener("jk:visitor-edit", () => openModal(true));
}
