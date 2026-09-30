import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        nexora: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#0b132b",
        },
        sidebar: {
          DEFAULT: "#0A101D",
          hover: "#152033",
          active: "#1E293B",
          border: "#1E293B",
          text: "#94A3B8",
          textActive: "#FFFFFF",
        }
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        "glass-hover": "0 14px 40px 0 rgba(31, 38, 135, 0.12)",
        glow: "0 0 25px -5px rgba(37, 99, 235, 0.35)",
        "glow-cyan": "0 0 25px -5px rgba(6, 182, 212, 0.4)",
        "glow-emerald": "0 0 25px -5px rgba(16, 185, 129, 0.4)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.65", transform: "scale(1.05)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        dash: {
          to: { strokeDashoffset: "-20" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 2.5s infinite ease-in-out",
        "float-slow": "floatSlow 4s ease-in-out infinite",
        "dash": "dash 1.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
