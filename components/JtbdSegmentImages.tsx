type Props = {
  urls: string[];
  title: string;
  pdfUrl?: string;
};

export function JtbdSegmentImages({ urls, title, pdfUrl }: Props) {
  return (
    <div className="mt-4">
      {urls.length === 0 ? (
        <p className="info-note">
          Картинки сегмента ещё не загружены. Запустите на компьютере:{" "}
          <code className="text-sm">импорт-jtbd-pdf.cmd</code>
        </p>
      ) : (
        <div className="jtbd-images">
          {urls.map((url, index) => (
            <img
              key={url}
              src={url}
              alt={`${title} — страница ${index + 1}`}
              className="jtbd-page-image"
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          ))}
        </div>
      )}

      {pdfUrl && (
        <a href={pdfUrl} download className="menu-item mt-3">
          <span className="menu-item-text">
            <span className="menu-item-title">Скачать PDF</span>
          </span>
        </a>
      )}
    </div>
  );
}
