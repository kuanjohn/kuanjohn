export function initGraph() {
  const el = document.getElementById("tech-graph");
  if (!el) return;

  const nodes = [
    { id: "VMware", x: 180, y: 80 },
    { id: "Automation", x: 320, y: 140 },
    { id: "Terraform", x: 420, y: 220 },
    { id: "Cloud", x: 300, y: 280 },
    { id: "AI Agents", x: 160, y: 240 },
    { id: "MCP", x: 80, y: 160 },
    { id: "Cursor", x: 100, y: 300 },
    { id: "Splunk", x: 260, y: 60 },
    { id: "Kubernetes", x: 400, y: 100 },
    { id: "Laravel", x: 220, y: 340 },
  ];
  const edges = [
    ["VMware", "Automation"],
    ["Automation", "Terraform"],
    ["Terraform", "Cloud"],
    ["Cloud", "AI Agents"],
    ["AI Agents", "MCP"],
    ["MCP", "Cursor"],
    ["Cursor", "Laravel"],
    ["AI Agents", "Laravel"],
    ["VMware", "Splunk"],
    ["Cloud", "Kubernetes"],
    ["Automation", "Kubernetes"],
  ];

  const W = 500, H = 400;
  let active = null;

  function connected(id) {
    const set = new Set([id]);
    edges.forEach(([a, b]) => {
      if (a === id) set.add(b);
      if (b === id) set.add(a);
    });
    return set;
  }

  function render() {
    const hi = active ? connected(active) : null;
    const edgeSvg = edges
      .map(([a, b]) => {
        const na = nodes.find((n) => n.id === a);
        const nb = nodes.find((n) => n.id === b);
        const on = !hi || (hi.has(a) && hi.has(b));
        return `<line x1="${na.x}" y1="${na.y}" x2="${nb.x}" y2="${nb.y}" stroke="${on ? "rgba(34,211,238,0.45)" : "rgba(255,255,255,0.06)"}" stroke-width="${on && hi ? 2 : 1}" />`;
      })
      .join("");
    const nodeSvg = nodes
      .map((n) => {
        const on = !hi || hi.has(n.id);
        return `<g class="graph-node cursor-pointer" data-id="${n.id}" opacity="${on ? 1 : 0.25}">
          <circle cx="${n.x}" cy="${n.y}" r="${n.id === active ? 18 : 14}" fill="${n.id === active ? "#3B82F6" : "#11161D"}" stroke="#22D3EE" stroke-width="1.5" />
          <text x="${n.x}" y="${n.y + 32}" text-anchor="middle" fill="rgba(255,255,255,0.75)" font-size="11" font-family="Manrope,sans-serif">${n.id}</text>
        </g>`;
      })
      .join("");
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="w-full" role="img" aria-label="Technology network graph">${edgeSvg}${nodeSvg}</svg>`;
    el.querySelectorAll(".graph-node").forEach((g) => {
      g.addEventListener("mouseenter", () => {
        active = g.dataset.id;
        render();
      });
      g.addEventListener("mouseleave", () => {
        active = null;
        render();
      });
    });
  }
  render();
}
