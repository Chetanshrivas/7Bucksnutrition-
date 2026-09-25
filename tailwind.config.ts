import type { Config } from "tailwindcss";

// Seven Bucks Nutrition — warm ivory / espresso / clay editorial palette.
// Sourced from the approved design reference, adapted for Tailwind 3.x.
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F8F5EF",
        sand: "#E7DBC5",
        clay: "#B65C2E",
        espresso: "#2B1F17",
        gold: "#C9A667",
        olive: "#6B6B47",

        background: "#F8F5EF",
        foreground: "#2B1F17",
        card: "#FFFFFF",
        "card-foreground": "#2B1F17",
        primary: "#2B1F17",
        "primary-foreground": "#F8F5EF",
        secondary: "#EFE8DA",
        "secondary-foreground": "#2B1F17",
        muted: "#EFE8DA",
        "muted-foreground": "#6B5F52",
        accent: "#B65C2E",
        "accent-foreground": "#F8F5EF",
        border: "#E2D8C6",
        destructive: "#B3261E",
        "destructive-foreground": "#F8F5EF",
      },
      fontFamily: {
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": [
          "clamp(2.75rem, 2rem + 3.5vw, 5.5rem)",
          { lineHeight: "1.05", letterSpacing: "-0.02em" },
        ],
        "display-lg": [
          "clamp(2.25rem, 1.75rem + 2.25vw, 4rem)",
          { lineHeight: "1.08", letterSpacing: "-0.015em" },
        ],
        "display-md": [
          "clamp(1.875rem, 1.55rem + 1.2vw, 2.75rem)",
          { lineHeight: "1.12", letterSpacing: "-0.01em" },
        ],
        "display-sm": ["clamp(1.5rem, 1.3rem + 0.8vw, 2rem)", { lineHeight: "1.15" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        body: ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.55" }],
        caption: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.01em" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      boxShadow: {
        lift: "0 24px 60px -20px rgba(43, 31, 23, 0.35)",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
