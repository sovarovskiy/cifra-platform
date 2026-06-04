import {
  SP551_PARKINGS_ARTICLE_BLOCKS,
  SP551_PARKINGS_RELATED_TOPICS,
} from "@/lib/pozharka-sp551-parkings-article";
import type { Sp551ParkingsMedia } from "@/lib/pozharka-sp551-parkings";
import { DocumentPagesView } from "@/components/DocumentPagesView";

type Props = {
  media: Sp551ParkingsMedia;
};

export function PozharkaArticleView({ media }: Props) {
  const videoUrl = media.videoUrl?.trim() || undefined;

  return (
    <article className="content-card info-article mt-4 flex-1">
      <h1 className="text-brand-title text-lg leading-snug">
        Подземные паркинги и электромобили: что меняет СП 551
      </h1>

      <div className="info-article-body mt-4 space-y-4 text-[15px] leading-relaxed text-[#1a1a1a]">
        {SP551_PARKINGS_ARTICLE_BLOCKS.map((block, index) => {
          if (block.type === "p") {
            return <p key={index}>{block.text}</p>;
          }
          if (block.type === "h3") {
            return (
              <p key={index} className="font-semibold text-[#1a535c]">
                {block.text}
              </p>
            );
          }
          return (
            <ul key={index} className="info-bullet-list">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        })}
      </div>

      {SP551_PARKINGS_RELATED_TOPICS.length > 0 && (
        <div className="info-section mt-6">
          <p className="info-section-title">Смежные материалы</p>
          <ul className="info-bullet-list mt-2">
            {SP551_PARKINGS_RELATED_TOPICS.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </div>
      )}

      <DocumentPagesView
        urls={media.imageUrls}
        title="СП 551 — паркинги и электромобили"
        pdfUrl={media.pdfUrl}
        importHint="импорт-sp551-паркинги.cmd"
        videoUrl={videoUrl}
      />
    </article>
  );
}
