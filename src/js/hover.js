const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initHover() {
  if (reduced() || window.matchMedia("(pointer: coarse)").matches) return;

  // Magnetic buttons
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
      el.style.transition = "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)";
      setTimeout(() => (el.style.transition = ""), 300);
    });
  });

  // Custom cursor ring
  const ring = document.getElementById("cursor-ring");
  if (!ring) return;
  let x = 0, y = 0, tx = 0, ty = 0;
  window.addEventListener("pointermove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
  });
  const loop = () => {
    x += (tx - x) * 0.2;
    y += (ty - y) * 0.2;
    ring.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  loop();

  document.querySelectorAll("a, button, .glass-card").forEach((el) => {
    el.addEventListener("pointerenter", () => {
      ring.style.width = "48px";
      ring.style.height = "48px";
      ring.style.opacity = "1";
    });
    el.addEventListener("pointerleave", () => {
      ring.style.width = "32px";
      ring.style.height = "32px";
    });
  });
}
