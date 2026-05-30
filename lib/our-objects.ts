import ourObjectsData from "@/data/our-objects.json";

export type OurObjectsContent = {
  pdfUrl: string;
  imageUrls: string[];
};

export function getOurObjectsContent(): OurObjectsContent {
  return ourObjectsData as OurObjectsContent;
}
