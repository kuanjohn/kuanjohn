/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}", "./src/js/**/*.js"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // All colors are driven by CSS variables (space-separated RGB channels)
        // defined in src/css/input.css, so they adapt between dark and light themes.
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          50: "rgb(var(--ink-50) / <alpha-value>)",
          100: "rgb(var(--ink-100) / <alpha-value>)",
          200: "rgb(var(--ink-200) / <alpha-value>)",
          300: "rgb(var(--ink-300) / <alpha-value>)",
        },
        // Foreground / text color
        fg: {
          DEFAULT: "rgb(var(--text) / <alpha-value>)",
        },
        // Neutral overlay surface (white in dark mode, slate in light mode)
        surface: "rgb(var(--surface) / <alpha-value>)",
        // Neutral border/line color
        line: "rgb(var(--line) / <alpha-value>)",
        accent: {
          blue: "rgb(var(--accent-blue) / <alpha-value>)",
          cyan: "rgb(var(--accent-cyan) / <alpha-value>)",
          glow: "rgb(var(--accent-glow) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ['"Syne"', "system-ui", "sans-serif"],
        sans: ['"Manrope"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 1px 0 0 rgb(var(--line) / 0.06), 0 18px 40px -24px rgb(0 0 0 / 0.5)",
        lift: "0 1px 0 0 rgb(var(--accent-cyan) / 0.25), 0 24px 48px -28px rgb(var(--accent-blue) / 0.45)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        aurora: "aurora 18s ease-in-out infinite",
        float: "float 8s ease-in-out infinite",
      },
      keyframes: {
        aurora: {
          "0%, 100%": { opacity: "0.4", transform: "translate3d(0,0,0) scale(1)" },
          "50%": { opacity: "0.65", transform: "translate3d(2%, -2%, 0) scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
