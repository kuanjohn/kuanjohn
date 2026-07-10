export function initTimeline() {
  document.querySelectorAll("[data-timeline-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest("[data-timeline-item]");
      const panel = card?.querySelector("[data-timeline-panel]");
      const open = card?.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (panel) {
        if (open) {
          panel.style.maxHeight = panel.scrollHeight + "px";
          panel.style.opacity = "1";
        } else {
          panel.style.maxHeight = "0px";
          panel.style.opacity = "0";
        }
      }
      const chev = btn.querySelector("[data-chevron]");
      if (chev) chev.style.transform = open ? "rotate(180deg)" : "";
    });
  });
}
