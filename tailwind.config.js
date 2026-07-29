/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary":           "#0b84da",
        "primary-dark":      "#0671c2",
        "primary-light":     "#38a8f5",
        "accent":            "#06b6d4",
        "background-light":  "#f5f7f8",
        "background-dark":   "#101b22",
        "surface-light":     "#ffffff",
        "surface-dark":      "#131f29",
      },
      fontFamily: {
        "display": ["Lexend", "sans-serif"],
        "arabic":  ["Cairo", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.375rem",
        "lg":      "0.625rem",
        "xl":      "0.875rem",
        "2xl":     "1rem",
        "3xl":     "1.25rem",
        "full":    "9999px",
      },
      boxShadow: {
        "glow":        "0 0 0 3px rgba(11,132,218,0.15), 0 4px 16px rgba(11,132,218,0.12)",
        "card":        "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
        "card-hover":  "0 8px 32px rgba(0,0,0,0.1)",
        "premium":     "0 1px 3px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)",
        "xl-colored":  "0 20px 50px rgba(11,132,218,0.2)",
      },
      animation: {
        "fade-in":       "fadeInUp 0.5s ease-out both",
        "fade-in-scale": "fadeInScale 0.4s ease-out both",
        "slide-right":   "slideInRight 0.35s ease-out both",
        "float-slow":    "floatSlow 7s ease-in-out infinite",
        "float-medium":  "floatMedium 5s ease-in-out infinite",
        "count-up":      "countUp 0.6s ease-out both",
        "gradient":      "gradientShift 3s ease infinite",
        "gpm-spin":      "gpm-spin 1.1s linear infinite",
        "gpm-float":     "gpm-float 2.5s ease-in-out infinite",
      },
      backgroundSize: {
        "200": "200% 200%",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
}
