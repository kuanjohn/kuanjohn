/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}", "./src/js/**/*.js"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#05070A",
          50: "#0B0F14",
          100: "#11161D",
          200: "#1A222D",
          300: "#243040",
        },
        accent: {
          blue: "#3B82F6",
          cyan: "#22D3EE",
          glow: "#60A5FA",
        },
      },
      fontFamily: {
        display: ['"Syne"', "system-ui", "sans-serif"],
        sans: ['"Manrope"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 0 0 1px rgba(34, 211, 238, 0.12), 0 20px 50px -20px rgba(0,0,0,0.6)",
        lift: "0 0 0 1px rgba(34, 211, 238, 0.2), 0 24px 48px -24px rgba(59, 130, 246, 0.35)",
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
          "0%, 100%": { opacity: "0.45", transform: "translate3d(0,0,0) scale(1)" },
          "50%": { opacity: "0.75", transform: "translate3d(2%, -2%, 0) scale(1.05)" },
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
