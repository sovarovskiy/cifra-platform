import fs from "fs";
import path from "path";
import type { TestQuestion, TestQuestionOption } from "./test-questions-types";

export type QuizTextQuestion = {
  text: string;
  options: Array<{ label: string; correct: boolean }>;
};

const OPTION_LINE = /^([A-D])\.\s*(.+)$/;

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

function isSectionTitle(line: string): boolean {
  const t = line.trim();
  if (/^\d+\s+вопрос/i.test(t)) return true;
  if (/блок по огз/i.test(t) && t.length < 80) return true;
  return false;
}

/** Парсит блоки: вопрос + A. B. C. D. (✅ у правильного) */
export function parseQuizBlockText(content: string): QuizTextQuestion[] {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  const blocks = normalized.split(/\n\s*\n+/);
  const out: QuizTextQuestion[] = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 5) continue;

    let qIndex = 0;
    if (isSectionTitle(lines[0]!)) qIndex = 1;
    const questionLine = lines[qIndex];
    if (!questionLine || /^[A-D]\./.test(questionLine)) continue;

    const options: Array<{ label: string; correct: boolean }> = [];
    for (let i = qIndex + 1; i < lines.length; i++) {
      const line = lines[i]!;
      const m = line.match(OPTION_LINE);
      if (!m) continue;
      const raw = m[2]!.trim();
      const correct = /✅/.test(raw);
      const label = raw.replace(/✅/g, "").trim();
      if (!label) continue;
      options.push({ label, correct });
    }

    if (options.length < 4) continue;
    if (!options.some((o) => o.correct)) continue;

    out.push({
      text: questionLine,
      options: options.slice(0, 4),
    });
  }

  return out;
}

export function quizTextToTestQuestions(
  parsed: QuizTextQuestion[],
  topic: string,
  idPrefix: string
): TestQuestion[] {
  return parsed.map((item, index) => {
    const id = `${idPrefix}-${String(index + 1).padStart(3, "0")}`;
    const correctLabel =
      item.options.find((o) => o.correct)?.label ?? item.options[0]!.label;
    const opts: TestQuestionOption[] = item.options.map((o, i) => ({
      id: String.fromCharCode(97 + i),
      label: o.label,
      correct: o.correct,
    }));
    return {
      id,
      topic,
      text: item.text,
      options: shuffleOptions(opts, id),
      explanation: correctLabel,
    };
  });
}

const TEXT_SOURCES: Array<{ file: string; topic: string; idPrefix: string }> = [
  { file: "ogz-basics.txt", topic: "ogz_basics", idPrefix: "quiz-basics" },
  { file: "ogz-works.txt", topic: "ogz_works", idPrefix: "quiz-works" },
  { file: "ogz-control.txt", topic: "ogz_control", idPrefix: "quiz-control" },
];

function resolveImportDir(): string {
  const inRepo = path.join(process.cwd(), "data", "test-import");
  if (fs.existsSync(path.join(inRepo, "ogz-basics.txt"))) return inRepo;
  return inRepo;
}

export function loadQuizTextQuestions(dir?: string): TestQuestion[] {
  const base = dir ?? resolveImportDir();
  const all: TestQuestion[] = [];
  for (const src of TEXT_SOURCES) {
    const filePath = path.join(base, src.file);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = parseQuizBlockText(content);
    all.push(...quizTextToTestQuestions(parsed, src.topic, src.idPrefix));
  }
  return all;
}
