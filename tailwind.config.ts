import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          lime: "#a3e635",
          "lime-dark": "#65a30d",
          neon: "#22d3ee",
        },
        surface: {
          900: "#0a0a0f",
          800: "#111118",
          700: "#1a1a24",
          600: "#24243a",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(163, 230, 53, 0.15)",
        "glow-lg": "0 0 40px rgba(163, 230, 53, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
