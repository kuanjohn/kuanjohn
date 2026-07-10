export function initCharts() {
  const radar = document.getElementById("skills-radar");
  if (!radar) return;

  const values = JSON.parse(radar.dataset.values || "[]");
  const labels = JSON.parse(radar.dataset.labels || "[]");
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const r = 120;
  const n = values.length || 1;

  const pts = values.map((v, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const rr = (v / 100) * r;
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });

  const grid = [0.25, 0.5, 0.75, 1]
    .map((s) => {
      const g = Array.from({ length: n }, (_, i) => {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        return `${cx + Math.cos(a) * r * s},${cy + Math.sin(a) * r * s}`;
      }).join(" ");
      return `<polygon points="${g}" fill="none" stroke="currentColor" stroke-opacity="0.12" />`;
    })
    .join("");

  const axes = labels
    .map((_, i) => {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2;
      return `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(a) * r}" y2="${cy + Math.sin(a) * r}" stroke="currentColor" stroke-opacity="0.15" />`;
    })
    .join("");

  const labelEls = labels
    .map((lab, i) => {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + Math.cos(a) * (r + 28);
      const y = cy + Math.sin(a) * (r + 28);
      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="currentColor" fill-opacity="0.7" font-size="11" font-family="Manrope,sans-serif">${lab}</text>`;
    })
    .join("");

  radar.innerHTML = `
    <svg viewBox="0 0 ${size} ${size}" class="mx-auto w-full max-w-sm" role="img" aria-label="Skills radar chart">
      ${grid}${axes}
      <polygon points="${pts.map((p) => p.join(",")).join(" ")}" fill="rgba(34,211,238,0.2)" stroke="#22D3EE" stroke-width="2" />
      ${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#3B82F6" />`).join("")}
      ${labelEls}
    </svg>`;
}
