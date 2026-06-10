import type { MetadataRoute } from "next";
import { ICON_BG, THEME_COLOR } from "@/lib/brand-icon";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Аналитическая платформа Цифра",
    short_name: "Цифра",
    description: "Квалификация лидов по скрипту ОГЗ",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: ICON_BG,
    theme_color: THEME_COLOR,
    lang: "ru",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
