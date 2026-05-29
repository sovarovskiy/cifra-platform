import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        surface: {
          DEFAULT: "#f0f9fb",
          card: "#ffffff",
          muted: "#e2e8f0",
        },
      },
      boxShadow: {
        card: "0 8px 32px rgba(15, 23, 42, 0.08), 0 1px 0 rgba(255, 255, 255, 0.85) inset",
        glass: "0 4px 24px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
        btn: "0 4px 20px rgba(20, 184, 166, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
        "btn-hover": "0 6px 28px rgba(20, 184, 166, 0.45)",
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #14b8a6 0%, #22d3ee 100%)",
        "page-mesh":
          "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(34, 211, 238, 0.18), transparent), radial-gradient(ellipse 60% 40% at 90% 10%, rgba(20, 184, 166, 0.12), transparent), radial-gradient(ellipse 50% 50% at 50% 100%, rgba(148, 163, 184, 0.08), transparent)",
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
