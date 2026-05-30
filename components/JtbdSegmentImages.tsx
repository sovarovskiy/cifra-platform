type Props = {
  urls: string[];
  title: string;
};

export function JtbdSegmentImages({ urls, title }: Props) {
  if (urls.length === 0) {
    return (
      <p className="info-note mt-4">
        Картинки сегмента ещё не загружены. Запустите на компьютере:{" "}
        <code className="text-sm">импорт-jtbd-pdf.cmd</code>
      </p>
    );
  }

  return (
    <div className="jtbd-images mt-4">
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
  );
}
