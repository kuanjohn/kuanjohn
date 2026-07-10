import { isContactUnlocked } from "./visitor.js";

/**
 * Contact gating: [data-gate] elements hold the real contact details (rendered
 * with inline display:none so nothing flashes before JS runs); [data-gate-locked]
 * elements hold the "reveal" prompt. We toggle inline display based on unlock state.
 *
 * The same unlock state also gates every download link (blocked until unlocked)
 * and blurs every [data-gate-photo] element (gallery + project screenshots).
 */
export function initGate() {
  // Download links that are not already wrapped in a [data-gate] block. The
  // resume inside contact/homepage is handled by the display toggle above, so
  // we skip those to avoid double-gating.
  const gatedDownloads = () =>
    Array.from(document.querySelectorAll("a[download]")).filter(
      (el) => !el.closest("[data-gate]")
    );

  const apply = (unlocked) => {
    document.querySelectorAll("[data-gate]").forEach((el) => {
      el.style.display = unlocked ? "" : "none";
    });
    document.querySelectorAll("[data-gate-locked]").forEach((el) => {
      el.style.display = unlocked ? "none" : "";
    });
    gatedDownloads().forEach((el) => {
      el.classList.toggle("gate-locked", !unlocked);
    });
    document.querySelectorAll("[data-gate-photo]").forEach((el) => {
      el.classList.toggle("gate-blur", !unlocked);
    });
  };

  apply(isContactUnlocked());

  document.addEventListener("jk:contact-unlocked", () => apply(true));

  document.querySelectorAll("[data-gate-unlock]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("jk:visitor-edit"));
    });
  });

  // Intercept clicks on locked download links (capture phase so we run before
  // the browser follows the link) and open the visitor modal instead.
  document.addEventListener(
    "click",
    (e) => {
      if (isContactUnlocked()) return;
      const link = e.target.closest?.("a[download]");
      if (!link || link.closest("[data-gate]")) return;
      e.preventDefault();
      e.stopPropagation();
      document.dispatchEvent(new CustomEvent("jk:visitor-edit"));
    },
    true
  );
}
