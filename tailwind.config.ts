import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7f7",
          100: "#dcebec",
          200: "#b8d7d9",
          300: "#8bbfc2",
          400: "#5a9fa4",
          500: "#1f6b70",
          600: "#1a5c60",
          700: "#164d50",
          800: "#123e41",
          900: "#0e2f32",
        },
        surface: {
          DEFAULT: "#f3f5f8",
          card: "#e7eaef",
          muted: "#d8dde4",
        },
      },
      boxShadow: {
        card: "0 10px 32px rgba(31, 107, 112, 0.1)",
        btn: "0 6px 24px rgba(31, 107, 112, 0.35)",
      },
      backgroundImage: {
        "accent-gradient":
          "linear-gradient(180deg, #25878d 0%, #1f6b70 48%, #1a5c60 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
