/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0A0A0B",
          soft: "#0F0F12",
          raised: "#131317"
        },
        foreground: {
          DEFAULT: "#EAEAF2",
          muted: "#A0A0B8",
        },
        primary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        accent: {
          500: "#22d3ee"
        },
        success: "#22c55e",
        danger: "#ef4444",
        warning: "#f59e0b"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "Noto Sans", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px rgba(0,0,0,0.25)",
        inner: "inset 0 1px 0 rgba(255,255,255,0.02)",
      },
      borderRadius: {
        xl: "1rem",
      }
    },
  },
  plugins: [],
}

