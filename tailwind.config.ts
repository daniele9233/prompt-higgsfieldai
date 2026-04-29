import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
    "./lib/**/*.{ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a0a",
          900: "#0a0a0a",
          800: "#111111",
          700: "#161616",
          600: "#1d1d1d",
          500: "#262626"
        },
        lime: {
          accent: "#c4ff3d",
          accentDim: "#9fd62f"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace"
        ]
      },
      boxShadow: {
        "lime-glow": "0 0 0 1px rgba(196,255,61,0.4), 0 8px 24px rgba(196,255,61,0.15)"
      },
      animation: {
        "pulse-soft": "pulse 2.6s cubic-bezier(0.4,0,0.6,1) infinite",
        "shimmer": "shimmer 1.8s linear infinite"
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" }
        }
      }
    }
  },
  plugins: []
};

export default config;
