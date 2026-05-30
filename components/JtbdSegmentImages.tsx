import { DocumentPagesView } from "@/components/DocumentPagesView";

type Props = {
  urls: string[];
  title: string;
  pdfUrl?: string;
};

export function JtbdSegmentImages(props: Props) {
  return <DocumentPagesView {...props} importHint="импорт-jtbd-pdf.cmd" />;
}
