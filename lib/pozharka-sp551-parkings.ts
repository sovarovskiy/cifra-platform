import manifest from "@/data/pozharka-sp551-parkings.json";

export type Sp551ParkingsMedia = {
  pdfUrl: string;
  videoUrl: string | null;
  imageUrls: string[];
};

export function getSp551ParkingsMedia(): Sp551ParkingsMedia {
  return manifest as Sp551ParkingsMedia;
}
