import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1A535C",
          50: "#f0f7f7",
          100: "#e5ecec",
          500: "#1A535C",
          600: "#16484f",
          700: "#123d43",
        },
        canvas: "#0F2427",
        ink: "#1A202C",
        muted: "#718096",
        danger: "#A63A50",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
