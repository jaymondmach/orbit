import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orbit: {
          bg: "#000000",
          surface: "#050505",
          surfaceMuted: "#0B0B0D",
          border: "rgba(255,255,255,0.08)",
          borderSoft: "rgba(255,255,255,0.04)",
          text: "#ffffff",
          muted: "rgba(255,255,255,0.6)",
          pink: "#ff6cab",
          purple: "#7366ff",
        },
      },
      backgroundImage: {
        "orbit-accent": "linear-gradient(135deg, #ff6cab, #7366ff)",
      },
      boxShadow: {
        "orbit-card": "0 18px 40px rgba(0,0,0,0.65)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      fontSize: {
        "2xs": "0.7rem",
      },
    },
  },
  plugins: [],
};

export default config;
