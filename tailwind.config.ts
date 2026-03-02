import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#059669", // Emerald 600
          foreground: "#ffffff",
          hover: "#047857", // Emerald 700
        },
        background: "#F8FAFC", // Light background
        card: "#ffffff",
      },
    },
  },
  plugins: [],
};
export default config;
