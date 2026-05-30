import { getReferenceEmbedUrl } from "@/lib/reference-sheet";

type Props = {
  title: string;
};

export function ReferenceSheetEmbed({ title }: Props) {
  return (
    <div className="reference-embed-wrap">
      <iframe
        src={getReferenceEmbedUrl()}
        title={title}
        className="reference-embed-frame"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
