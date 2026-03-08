import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        phorium: {
          bg: "#0F2F2F",        // mørk bakgrunn (kan justeres)
          surface: "#143C3C",   // cards / flater
          accent: "#8EA07D",    // handling / fokus
          text: "#ECE8DA",      // primær tekst
          muted: "#DCD8CA",     // sekundær tekst
        },
      },
    },
  },
  plugins: [],
};

export default config;
