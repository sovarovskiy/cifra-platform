"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getReferenceEmbedUrl } from "@/lib/reference-sheet";

type Props = {
  title: string;
};

/** Ширина «логического» холста Google embed — масштабируем под экран */
const EMBED_LOGICAL_WIDTH = 1100;
const EMBED_LOGICAL_HEIGHT = 900;

export function ReferenceSheetEmbed({ title }: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const fitToWidth = useCallback(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const availableW = outer.clientWidth;
    if (availableW <= 0) return;
    setScale(Math.min(1, availableW / EMBED_LOGICAL_WIDTH));
  }, []);

  useEffect(() => {
    fitToWidth();
    const outer = outerRef.current;
    if (!outer) return;
    const ro = new ResizeObserver(fitToWidth);
    ro.observe(outer);
    window.addEventListener("resize", fitToWidth);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fitToWidth);
    };
  }, [fitToWidth]);

  const scaledHeight = EMBED_LOGICAL_HEIGHT * scale;

  return (
    <div
      ref={outerRef}
      className="reference-embed-fit"
      style={{ height: scaledHeight }}
    >
      <div
        className="reference-embed-fit-inner"
        style={{
          width: EMBED_LOGICAL_WIDTH,
          height: EMBED_LOGICAL_HEIGHT,
          transform: `scale(${scale})`,
        }}
      >
        <iframe
          src={getReferenceEmbedUrl()}
          title={title}
          className="reference-embed-frame"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
