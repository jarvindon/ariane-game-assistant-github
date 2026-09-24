import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070b14",
        panel: "#0d1424",
        cyan: "#53e5ff",
        violet: "#9d83ff"
      },
      boxShadow: {
        neon: "0 0 32px rgba(83, 229, 255, .12)"
      }
    }
  },
  plugins: []
};

export default config;
