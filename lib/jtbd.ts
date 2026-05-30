import jtbdData from "@/data/jtbd.json";

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
};

export function resolveJtbd(id: string): JtbdSegment | undefined {
  const raw = (jtbdData as Record<string, JtbdEntry>)[id];
  if (!raw) return undefined;

  if (raw.mainTask) {
    return { id, title: raw.title, mainTask: raw.mainTask, salesLanguage: raw.salesLanguage };
  }

  if (raw.inherits) {
    const base = resolveJtbd(raw.inherits);
    if (!base) return { id, title: raw.title, inherits: raw.inherits };
    return {
      id,
      title: raw.title,
      inherits: raw.inherits,
      baseId: raw.inherits,
      mainTask: base.mainTask,
      salesLanguage: base.salesLanguage,
    };
  }

  return { id, title: raw.title };
}

export function listJtbdSegments(): JtbdSegment[] {
  return Object.keys(jtbdData as Record<string, JtbdEntry>)
    .sort((a, b) => a.localeCompare(b, "ru"))
    .map((id) => resolveJtbd(id)!)
    .filter(Boolean);
}
