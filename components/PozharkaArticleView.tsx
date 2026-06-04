import type {
  ArticleBlock,
  PozharkaArticleMedia,
} from "@/lib/pozharka-article-types";
import { DocumentPagesView } from "@/components/DocumentPagesView";

type Props = {
  title: string;
  blocks: ArticleBlock[];
  relatedTopics?: string[];
  media: PozharkaArticleMedia;
  imagesTitle: string;
  importHint: string;
};

export function PozharkaArticleView({
  title,
  blocks,
  relatedTopics = [],
  media,
  imagesTitle,
  importHint,
}: Props) {
  const videoUrl = media.videoUrl?.trim() || undefined;

  return (
    <article className="content-card info-article mt-4 flex-1">
      <h1 className="text-brand-title text-lg leading-snug">{title}</h1>

      <div className="info-article-body mt-4 space-y-4 text-[15px] leading-relaxed text-[#1a1a1a]">
        {blocks.map((block, index) => {
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

      {relatedTopics.length > 0 && (
        <div className="info-section mt-6">
          <p className="info-section-title">Смежные материалы</p>
          <ul className="info-bullet-list mt-2">
            {relatedTopics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </div>
      )}

      <DocumentPagesView
        urls={media.imageUrls}
        title={imagesTitle}
        pdfUrl={media.pdfUrl}
        importHint={importHint}
        videoUrl={videoUrl}
      />
    </article>
  );
}
