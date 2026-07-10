import { isContactUnlocked } from "./visitor.js";

/**
 * Contact gating: [data-gate] elements hold the real contact details (rendered
 * with inline display:none so nothing flashes before JS runs); [data-gate-locked]
 * elements hold the "reveal" prompt. We toggle inline display based on unlock state.
 */
export function initGate() {
  const apply = (unlocked) => {
    document.querySelectorAll("[data-gate]").forEach((el) => {
      el.style.display = unlocked ? "" : "none";
    });
    document.querySelectorAll("[data-gate-locked]").forEach((el) => {
      el.style.display = unlocked ? "none" : "";
    });
  };

  apply(isContactUnlocked());

  document.addEventListener("jk:contact-unlocked", () => apply(true));

  document.querySelectorAll("[data-gate-unlock]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("jk:visitor-edit"));
    });
  });
}
