"use client";

import Link from "next/link";

type Props = {
  url: string;
  title: string;
};

export function JtbdPdfViewer({ url, title }: Props) {
  return (
    <section className="info-section">
      <h2 className="info-section-title">Разбор сегмента (PDF)</h2>
      <div className="jtbd-pdf-wrap">
        <iframe src={url} title={title} className="jtbd-pdf-frame" />
      </div>
      <Link href={url} target="_blank" rel="noopener noreferrer" className="menu-item mt-3">
        <span className="menu-item-text">
          <span className="menu-item-title">Открыть PDF</span>
        </span>
      </Link>
    </section>
  );
}
