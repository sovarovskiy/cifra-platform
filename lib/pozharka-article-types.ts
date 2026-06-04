export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "h3"; text: string };

export type PozharkaArticleContent = {
  blocks: ArticleBlock[];
  relatedTopics?: string[];
};

export type PozharkaArticleMedia = {
  pdfUrl: string;
  videoUrl: string | null;
  imageUrls: string[];
};
