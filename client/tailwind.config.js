/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "seeme-bg": "#0a0a0f",
        "seeme-surface": "#12121a",
        "seeme-card": "#1a1a2e",
        "seeme-border": "#2a2a3e",
        "seeme-accent": "#6c5ce7",
        "seeme-accent2": "#00cec9",
        "seeme-gold": "#ffd32a",
        "seeme-xp": "#00b894",
        "seeme-danger": "#ff6b6b",
        "seeme-warn": "#fdcb6e",
        "seeme-text": "#e0e0f0",
        "seeme-muted": "#8888a8",
        bronze: "#cd7f32",
        silver: "#c0c0c0",
        gold: "#ffd700",
        unicorn: "#e056fd",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "monospace"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      animation: {
        "score-pulse": "scorePulse 0.6s ease-in-out",
        "xp-fill": "xpFill 1.2s ease-out forwards",
        "badge-pop": "badgePop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "streak-glow": "streakGlow 2s ease-in-out infinite",
        "diff-slide": "diffSlide 0.4s ease-out",
        "float-up": "floatUp 0.8s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        scorePulse: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        xpFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--xp-width)" },
        },
        badgePop: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        streakGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(253, 203, 110, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(253, 203, 110, 0.8)" },
        },
        diffSlide: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        floatUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
