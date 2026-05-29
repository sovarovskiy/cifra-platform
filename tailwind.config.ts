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
        card: "0 12px 40px rgba(51, 128, 252, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.88)",
        glass: "0 8px 32px rgba(15, 23, 42, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
        btn: "0 6px 28px rgba(51, 128, 252, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
        wizard: "0 20px 50px rgba(29, 95, 241, 0.12), 0 8px 24px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        "accent-gradient":
          "linear-gradient(135deg, #3380fc 0%, #22d3ee 100%)",
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
