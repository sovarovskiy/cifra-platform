import fs from "fs";
import path from "path";
import type { TestQuestion, TestQuestionOption } from "./test-questions-types";

export type CsvQuestionRow = {
  text: string;
  correct: string;
  /** Три готовых неверных ответа из CSV (предпочтительный формат) */
  wrongs?: [string, string, string];
};

/** Убирает хвостовые метки источников вида .consaltika+1 */
export function cleanCsvAnswer(raw: string): string {
  let s = raw.trim().replace(/^"|"$/g, "");
  while (/\.[a-z0-9][\w-]*(\+\d+)?$/i.test(s)) {
    s = s.replace(/\.[a-z0-9][\w-]*(\+\d+)?$/i, "").trim();
  }
  return s;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!;
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

function isHeaderRow(cols: string[]): boolean {
  const joined = cols.join(" ").toLowerCase();
  return /вопрос/.test(joined) && (/правильн|верн|неверн|ошиб/i.test(joined) || cols.length >= 5);
}

function normKey(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export function parseCsvQuestionFile(content: string): CsvQuestionRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  const rows: CsvQuestionRow[] = [];

  for (let i = 0; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]!);
    if (cols.length < 2) continue;

    const text = cols[0]!.trim().replace(/^"|"$/g, "");
    if (i === 0 && isHeaderRow(cols)) continue;
    if (!text) continue;

    const correct = cleanCsvAnswer(cols[1] ?? "");
    if (!correct) continue;

    if (cols.length >= 5) {
      const w1 = cleanCsvAnswer(cols[2] ?? "");
      const w2 = cleanCsvAnswer(cols[3] ?? "");
      const w3 = cleanCsvAnswer(cols[4] ?? "");
      if (!w1 || !w2 || !w3) continue;
      rows.push({ text, correct, wrongs: [w1, w2, w3] });
      continue;
    }

    rows.push({ text, correct });
  }

  return rows;
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

function shuffleOptions(
  options: TestQuestionOption[],
  seed: string
): TestQuestionOption[] {
  const copy = [...options];
  let state = hashSeed(seed);
  for (let i = copy.length - 1; i > 0; i--) {
    state = (Math.imul(1103515245, state) + 12345) >>> 0;
    const j = state % (i + 1);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.map((o, idx) => ({
    ...o,
    id: String.fromCharCode(97 + idx),
  }));
}

function truncateLabel(label: string, max = 200): string {
  const t = label.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Запасной режим для старых CSV из 2 колонок (без готовых дистракторов) */
function pickWrongsFromPool(pool: string[], correct: string, seed: string): string[] {
  const correctN = normKey(correct);
  const candidates = pool.filter((a) => normKey(a) !== correctN);
  let state = hashSeed(`${seed}:wrongs`);
  const picked: string[] = [];
  const used = new Set<string>();
  let guard = 0;
  while (picked.length < 3 && guard < candidates.length * 4) {
    guard++;
    state = (Math.imul(1103515245, state) + 12345) >>> 0;
    const item = candidates[state % candidates.length]!;
    const key = normKey(item);
    if (used.has(key)) continue;
    used.add(key);
    picked.push(truncateLabel(item));
  }
  return picked.slice(0, 3);
}

function buildOptions(
  id: string,
  correct: string,
  wrongs: string[]
): TestQuestionOption[] {
  const correctN = normKey(correct);
  const uniqueWrongs: string[] = [];
  for (const w of wrongs) {
    const label = truncateLabel(w);
    if (!label || normKey(label) === correctN) continue;
    if (uniqueWrongs.some((x) => normKey(x) === normKey(label))) continue;
    uniqueWrongs.push(label);
    if (uniqueWrongs.length >= 3) break;
  }

  while (uniqueWrongs.length < 3) {
    uniqueWrongs.push(`Вариант ${uniqueWrongs.length + 1}`);
  }

  const options: TestQuestionOption[] = [
    { id: "a", label: truncateLabel(correct), correct: true },
    ...uniqueWrongs.slice(0, 3).map((label, i) => ({
      id: String.fromCharCode(98 + i),
      label,
      correct: false,
    })),
  ];

  return shuffleOptions(options, id);
}

export function csvRowsToTestQuestions(
  rows: CsvQuestionRow[],
  topic: string,
  idPrefix: string
): TestQuestion[] {
  const pool = rows.map((r) => r.correct);

  return rows.map((row, index) => {
    const id = `${idPrefix}-${String(index + 1).padStart(3, "0")}`;
    const correct = truncateLabel(row.correct);
    const wrongs =
      row.wrongs ??
      (pickWrongsFromPool(pool, row.correct, id) as [string, string, string]);

    return {
      id,
      topic,
      text: row.text,
      options: buildOptions(id, correct, [...wrongs]),
      explanation: correct,
    };
  });
}

const CSV_SOURCES: Array<{ file: string; topic: string; idPrefix: string }> = [
  { file: "2.csv", topic: "ogz_works", idPrefix: "csv-works" },
  { file: "3.csv", topic: "ogz_control", idPrefix: "csv-control" },
];

function resolveCsvDir(): string {
  const inRepo = path.join(process.cwd(), "data", "test-import");
  if (fs.existsSync(path.join(inRepo, "1.csv"))) return inRepo;

  const desktop = path.join(
    process.env.USERPROFILE ?? "",
    "OneDrive",
    "Рабочий стол"
  );
  if (fs.existsSync(path.join(desktop, "1.csv"))) return desktop;

  return inRepo;
}

export function loadCsvTestQuestions(dir?: string): TestQuestion[] {
  const base = dir ?? resolveCsvDir();
  const all: TestQuestion[] = [];
  for (const src of CSV_SOURCES) {
    const filePath = path.join(base, src.file);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, "utf8");
    const rows = parseCsvQuestionFile(content);
    all.push(...csvRowsToTestQuestions(rows, src.topic, src.idPrefix));
  }
  return all;
}
