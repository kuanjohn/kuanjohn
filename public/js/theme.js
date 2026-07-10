const KEY = "jk-theme";

export function initTheme() {
  const stored = localStorage.getItem(KEY);
  const preferDark = !window.matchMedia("(prefers-color-scheme: light)").matches;
  const dark = stored ? stored === "dark" : preferDark;
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.classList.toggle("light", !dark);

  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    const nextDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextDark);
    document.documentElement.classList.toggle("light", !nextDark);
    localStorage.setItem(KEY, nextDark ? "dark" : "light");
  });
}
