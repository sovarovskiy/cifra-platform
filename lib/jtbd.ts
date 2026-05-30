import jtbdData from "@/data/jtbd.json";
import jtbdImages from "@/data/jtbd-images.json";

export type JtbdEntry = {
  title: string;
  mainTask?: string;
  salesLanguage?: string;
  inherits?: string;
};

export type JtbdSegment = {
  id: string;
  title: string;
  mainTask?: string;
  salesLanguage?: string;
  inherits?: string;
  baseId?: string;
  imageUrls: string[];
};

/** Сегменты с PDF-разборами «деловой» */
export const JTBD_PDF_SEGMENT_IDS = [
  "A-01",
  "B-0",
  "B-03",
  "C-0",
  "C-02",
  "E-04",
  "E-05",
] as const;

export type JtbdPdfSegmentId = (typeof JTBD_PDF_SEGMENT_IDS)[number];

const PDF_SOURCE_NAMES: Record<JtbdPdfSegmentId, string> = {
  "A-01": "A-01 деловой.pdf",
  "B-0": "B-0 деловой.pdf",
  "B-03": "B-03 деловой.pdf",
  "C-0": "C-0 деловой.pdf",
  "C-02": "C-02 деловой.pdf",
  "E-04": "E-04 деловой.pdf",
  "E-05": "E-05 деловой.pdf",
};

const imageManifest = jtbdImages as Record<string, string[]>;

export function getJtbdPdfSourceName(segmentId: JtbdPdfSegmentId): string {
  return PDF_SOURCE_NAMES[segmentId];
}

export function getJtbdImageUrls(segmentId: string): string[] {
  const direct = imageManifest[segmentId];
  if (direct?.length) return direct;

  const raw = (jtbdData as Record<string, JtbdEntry>)[segmentId];
  if (raw?.inherits) return getJtbdImageUrls(raw.inherits);

  return imageManifest[segmentId] ?? [];
}

export function resolveJtbd(id: string): JtbdSegment | undefined {
  const raw = (jtbdData as Record<string, JtbdEntry>)[id];
  if (!raw) return undefined;

  const imageUrls = getJtbdImageUrls(id);

  if (raw.mainTask) {
    return {
      id,
      title: raw.title,
      mainTask: raw.mainTask,
      salesLanguage: raw.salesLanguage,
      imageUrls,
    };
  }

  if (raw.inherits) {
    const base = resolveJtbd(raw.inherits);
    if (!base) return { id, title: raw.title, inherits: raw.inherits, imageUrls };
    return {
      id,
      title: raw.title,
      inherits: raw.inherits,
      baseId: raw.inherits,
      mainTask: base.mainTask,
      salesLanguage: base.salesLanguage,
      imageUrls,
    };
  }

  return { id, title: raw.title, imageUrls };
}

export function listJtbdPdfSegments(): JtbdSegment[] {
  return JTBD_PDF_SEGMENT_IDS.map((id) => resolveJtbd(id)!);
}

export function listJtbdSegments(): JtbdSegment[] {
  return Object.keys(jtbdData as Record<string, JtbdEntry>)
    .sort((a, b) => a.localeCompare(b, "ru"))
    .map((id) => resolveJtbd(id)!)
    .filter(Boolean);
}
