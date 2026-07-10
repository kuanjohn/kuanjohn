export function initContact() {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        const prev = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => (btn.textContent = prev), 1600);
      } catch {
        /* ignore */
      }
    });
  });
}
