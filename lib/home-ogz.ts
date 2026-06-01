import homeOgzData from "@/data/home-ogz.json";

export type HomeOgzContent = {
  pdfUrl: string;
  imageUrls: string[];
};

export function getHomeOgzContent(): HomeOgzContent {
  return homeOgzData as HomeOgzContent;
}
