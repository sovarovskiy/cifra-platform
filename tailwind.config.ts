import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#5ecf8a",
          500: "#22a058",
          600: "#1b7a4a",
          700: "#166534",
          800: "#14532d",
          900: "#052e16",
        },
        surface: {
          DEFAULT: "#f0faf4",
          card: "#ffffff",
          muted: "#e2e8f0",
        },
      },
      boxShadow: {
        card: "0 12px 40px rgba(20, 83, 45, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.88)",
        glass: "0 8px 32px rgba(20, 83, 45, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
        btn: "0 6px 28px rgba(34, 160, 88, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
        wizard: "0 20px 50px rgba(20, 83, 45, 0.14), 0 8px 24px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        "accent-gradient":
          "linear-gradient(135deg, #1b7a4a 0%, #22a058 48%, #5ecf8a 100%)",
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
