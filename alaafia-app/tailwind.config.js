/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary — teal/green
        primary: "#005c55",
        "primary-container": "#0f766e",
        "on-primary": "#ffffff",
        "on-primary-container": "#a3faef",
        "primary-fixed": "#9cf2e8",
        "primary-fixed-dim": "#80d5cb",
        "on-primary-fixed": "#00201d",
        "on-primary-fixed-variant": "#00504a",
        "inverse-primary": "#80d5cb",

        // Secondary — amber/orange
        secondary: "#904d00",
        "secondary-container": "#fe932c",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#663500",
        "secondary-fixed": "#ffdcc3",
        "secondary-fixed-dim": "#ffb77d",
        "on-secondary-fixed": "#2f1500",
        "on-secondary-fixed-variant": "#6e3900",

        // Tertiary — crimson/red
        tertiary: "#a6002f",
        "tertiary-container": "#d2093f",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#ffe4e4",
        "tertiary-fixed": "#ffdada",
        "tertiary-fixed-dim": "#ffb3b6",
        "on-tertiary-fixed": "#40000c",
        "on-tertiary-fixed-variant": "#920028",

        // Background / Surface
        background: "#f9f9ff",
        "on-background": "#111c2d",
        surface: "#f9f9ff",
        "on-surface": "#111c2d",
        "surface-tint": "#006a63",
        "surface-bright": "#f9f9ff",
        "surface-dim": "#cfdaf2",
        "surface-variant": "#d8e3fb",
        "on-surface-variant": "#3e4947",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f0f3ff",
        "surface-container": "#e7eeff",
        "surface-container-high": "#dee8ff",
        "surface-container-highest": "#d8e3fb",
        "inverse-surface": "#263143",
        "inverse-on-surface": "#ecf1ff",

        // Outline
        "outline-variant": "#bdc9c6",
        outline: "#6e7977",

        // Error
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
      },
      fontFamily: {
        sans: ['"Satoshi"', '"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        jakarta: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        satoshi: ['"Satoshi"', "system-ui", "sans-serif"],
      },
      spacing: {
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "margin-mobile": "20px",
        gutter: "16px",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      keyframes: {
        slideUp: {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        msgPop: {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        tdot: {
          "0%, 80%, 100%": { transform: "translateY(0)", opacity: "0.6" },
          "40%": { transform: "translateY(-7px)", opacity: "1" },
        },
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        recPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(186,26,26,.35)" },
          "50%": { boxShadow: "0 0 0 8px rgba(186,26,26,0)" },
        },
        payGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(17,118,110,.3)" },
          "50%": { boxShadow: "0 0 0 10px rgba(17,118,110,0)" },
        },
        liveDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        checkBounce: {
          "0%": { transform: "scale(0)" },
          "70%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        wavebar: {
          from: { transform: "scaleY(1)" },
          to: { transform: "scaleY(0.4)" },
        },
      },
      animation: {
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in-up": "fadeInUp 0.35s ease both",
        "msg-pop": "msgPop 0.25s ease-out",
        tdot: "tdot 1.4s infinite ease-in-out both",
        "pulse-ring": "pulseRing 2s ease-out infinite",
        "rec-pulse": "recPulse 1s infinite",
        "pay-glow": "payGlow 2s infinite",
        "live-dot": "liveDot 1.2s infinite",
        "check-bounce": "checkBounce 0.5s ease-out",
        spin: "spin 0.8s linear infinite",
        wavebar: "wavebar 1.1s infinite ease-in-out alternate",
      },
    },
  },
  plugins: [],
};
