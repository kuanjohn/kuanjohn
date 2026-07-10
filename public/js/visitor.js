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

/** Contact details unlock only when the visitor has provided BOTH name and email. */
export function isContactUnlocked() {
  const d = readLocal();
  return !!(d && d.name && d.email);
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
  document.getElementById("visitor-name")?.focus();
}

function closeModal() {
  const modal = document.getElementById("visitor-modal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

export function initVisitor() {
  if (!document.getElementById("visitor-modal")) {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div id="visitor-modal" class="visitor-modal" aria-hidden="true" role="dialog" aria-labelledby="visitor-title">
        <div class="glass max-w-md w-full rounded-2xl p-8">
          <p class="eyebrow">Introduce yourself</p>
          <h2 id="visitor-title" class="display mt-2 text-2xl">Reveal contact details</h2>
          <p class="mt-3 text-sm text-fg/60">Share your name and email to unlock John's email, phone, social links, and resume. It only takes a moment.</p>
          <form id="visitor-form" class="mt-6 space-y-4" novalidate>
            <input type="text" name="website" class="hidden" tabindex="-1" autocomplete="off" aria-hidden="true" />
            <div>
              <label class="text-xs text-fg/55" for="visitor-name">Name</label>
              <input id="visitor-name" name="name" type="text" required class="mt-1 w-full rounded-xl border border-line/12 bg-surface/5 px-4 py-3 text-sm text-fg outline-none focus:border-accent-cyan/50" placeholder="Your name" />
            </div>
            <div>
              <label class="text-xs text-fg/55" for="visitor-email">Email</label>
              <input id="visitor-email" name="email" type="email" required class="mt-1 w-full rounded-xl border border-line/12 bg-surface/5 px-4 py-3 text-sm text-fg outline-none focus:border-accent-cyan/50" placeholder="you@company.com" />
            </div>
            <p id="visitor-error" class="hidden text-xs text-red-400"></p>
            <div class="flex flex-wrap gap-3 pt-2">
              <button type="submit" class="btn-primary">Reveal contact</button>
              <button type="button" id="visitor-skip" class="btn-ghost">Skip for now</button>
            </div>
            <p class="text-xs text-fg/40">Stored locally and on Cloudflare KV for visit counts, and used to let John know you stopped by. No marketing spam.</p>
          </form>
        </div>
      </div>
      <div id="welcome-back" class="pointer-events-none fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-accent-cyan/30 bg-ink-50/90 px-4 py-2 text-sm text-fg opacity-0 transition-opacity duration-500"></div>`;
    document.body.appendChild(wrap);
  }

  const existing = readLocal();
  if (isContactUnlocked()) {
    showWelcomeBack(existing);
    persist(existing); // ping visit count (worker dedupes email notification)
  } else if (!existing?.seenAt) {
    setTimeout(() => openModal(false), 1500);
  }

  const errorEl = () => document.getElementById("visitor-error");
  const showError = (msg) => {
    const el = errorEl();
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
  };
  const clearError = () => errorEl()?.classList.add("hidden");

  document.getElementById("visitor-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (fd.get("website")) {
      closeModal();
      return;
    }
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    if (!name || !email) {
      showError("Please add both your name and email to reveal contact details.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Please enter a valid email address.");
      return;
    }
    clearError();
    const data = {
      id: existing?.id || uuid(),
      name,
      email,
      seenAt: new Date().toISOString(),
    };
    writeLocal(data);
    await persist(data);
    closeModal();
    showWelcomeBack(data);
    document.dispatchEvent(new CustomEvent("jk:contact-unlocked"));
  });

  document.getElementById("visitor-skip")?.addEventListener("click", async () => {
    const data = {
      id: existing?.id || uuid(),
      name: existing?.name || "",
      email: existing?.email || "",
      seenAt: new Date().toISOString(),
    };
    writeLocal(data);
    await persist(data);
    closeModal();
  });

  document.getElementById("visitor-edit")?.addEventListener("click", () => openModal(true));
  document.addEventListener("jk:visitor-edit", () => openModal(true));
}
