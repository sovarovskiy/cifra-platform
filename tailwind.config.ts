import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ebff",
          200: "#bcdcff",
          300: "#8ec6ff",
          400: "#59a5ff",
          500: "#3380fc",
          600: "#1d5ff1",
          700: "#1a4bde",
          800: "#1c3eb4",
          900: "#1c378e",
        },
        surface: {
          DEFAULT: "#f4f6fb",
          card: "#ffffff",
          muted: "#e8edf5",
        },
      },
      boxShadow: {
        card: "0 4px 24px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)",
        btn: "0 2px 8px rgba(51, 128, 252, 0.25)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
