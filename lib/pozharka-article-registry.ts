import type { PozharkaArticleContent } from "./pozharka-article-types";

import sp551Article from "@/data/pozharka-sp551-parkings-article.json";
import sp551Media from "@/data/pozharka-sp551-parkings.json";
import fireDocsArticle from "@/data/pozharka-fire-docs-after-repair-article.json";
import fireDocsMedia from "@/data/pozharka-fire-docs-after-repair.json";

export type PozharkaArticleConfig = {
  slug: string;
  menuTitle: string;
  menuDescription: string;
  pageTitle: string;
  imagesTitle: string;
  importHint: string;
  content: PozharkaArticleContent;
  media: {
    pdfUrl: string;
    videoUrl: string | null;
    imageUrls: string[];
  };
};

export const POZHARKA_ARTICLE_CONFIGS: Record<string, PozharkaArticleConfig> = {
  "sp-551-parkings": {
    slug: "sp-551-parkings",
    menuTitle: "Подземные паркинги и электромобили что меняет СП 551",
    menuDescription:
      "СП 551.1311500.2026: требования к стоянкам с электромобилями",
    pageTitle: "Подземные паркинги и электромобили: что меняет СП 551",
    imagesTitle: "СП 551 — паркинги и электромобили",
    importHint: "импорт-sp551-паркинги.cmd",
    content: sp551Article as PozharkaArticleContent,
    media: sp551Media,
  },
  "fire-docs-after-repair": {
    slug: "fire-docs-after-repair",
    menuTitle:
      "Как обновлять пожарные документы в организации после ремонта?",
    menuDescription:
      "Порядок актуализации документации по пожарной безопасности",
    pageTitle:
      "Как обновлять пожарные документы в организации после ремонта?",
    imagesTitle: "Пожарные документы после ремонта",
    importHint: "импорт-пожарные-документы-после-ремонта.cmd",
    content: fireDocsArticle as PozharkaArticleContent,
    media: fireDocsMedia,
  },
};

export function getPozharkaArticleConfig(
  slug: string
): PozharkaArticleConfig | undefined {
  return POZHARKA_ARTICLE_CONFIGS[slug];
}
