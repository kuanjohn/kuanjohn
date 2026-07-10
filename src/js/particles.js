const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas || reduced()) return;
  const ctx = canvas.getContext("2d");
  let w, h, particles, raf;

  const dotColor = () => {
    const ch = getComputedStyle(document.documentElement).getPropertyValue("--accent-cyan").trim();
    return ch ? `rgba(${ch.split(/\s+/).join(", ")}, 0.28)` : "rgba(34, 211, 238, 0.28)";
  };
  let fill = dotColor();

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    particles = Array.from({ length: Math.min(30, Math.floor(w / 64)) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
  new MutationObserver(() => {
    fill = dotColor();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else draw();
  });
}
