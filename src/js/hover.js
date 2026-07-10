const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initHover() {
  if (reduced() || window.matchMedia("(pointer: coarse)").matches) return;

  // Magnetic buttons — subtle pull toward the cursor
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
      el.style.transition = "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)";
      setTimeout(() => (el.style.transition = ""), 300);
    });
  });
}
