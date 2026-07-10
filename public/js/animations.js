const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initAnimations() {
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 600, once: true, offset: 40, easing: "ease-out-cubic", anchorPlacement: "top-bottom", disable: reduced() });
  } else {
    // Fallback: if AOS failed to load, never leave content stuck invisible.
    document.querySelectorAll("[data-aos]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }

  // Rotating titles
  const el = document.getElementById("rotating-title");
  if (el) {
    const titles = JSON.parse(el.dataset.titles || "[]");
    let i = 0;
    if (titles.length && typeof gsap !== "undefined" && !reduced()) {
      const swap = () => {
        gsap.to(el, {
          y: -12,
          opacity: 0,
          duration: 0.35,
          ease: "power2.in",
          onComplete: () => {
            i = (i + 1) % titles.length;
            el.textContent = titles[i];
            gsap.fromTo(el, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" });
          },
        });
      };
      setInterval(swap, 2800);
    } else if (titles.length) {
      setInterval(() => {
        i = (i + 1) % titles.length;
        el.textContent = titles[i];
      }, 2800);
    }
  }

  // Counters
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const node = entry.target;
          const target = Number(node.dataset.count || 0);
          const suffix = node.dataset.suffix || "";
          const prefix = node.dataset.prefix || "";
          const duration = 1400;
          const start = performance.now();
          const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            const val = Math.round(target * eased);
            node.textContent = prefix + val.toLocaleString() + suffix;
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.unobserve(node);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((c) => io.observe(c));
  }

  // Hero entrance — animate transform only (never opacity) so content can
  // never get stuck invisible if the tween stalls (e.g. background tab rAF).
  if (typeof gsap !== "undefined" && !reduced()) {
    gsap.from("[data-hero]", {
      y: 24,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
      delay: 0.05,
      clearProps: "transform",
    });
  }

  // Progress bars
  document.querySelectorAll(".progress-bar[data-value]").forEach((bar) => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          bar.style.width = bar.dataset.value + "%";
          io.unobserve(bar);
        }
      });
    });
    io.observe(bar);
  });
}
