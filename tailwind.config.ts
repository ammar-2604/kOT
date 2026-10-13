import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kot: {
          navy: "#0F172A",
          dark: "#1E293B",
          primary: "#1D4ED8",
          primaryHover: "#1E40AF",
          accent: "#0284C7",
          amber: "#D97706",
          red: "#DC2626",
          green: "#059669",
          slate: "#334155",
          border: "#E2E8F0",
          card: "#FFFFFF",
          bg: "#F8FAFC",
        },
      },
    },
  },
  plugins: [],
};

export default config;
