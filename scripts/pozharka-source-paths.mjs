import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.join(__dirname, "..");

function existsDir(dir) {
  try {
    return Boolean(dir && fs.existsSync(dir) && fs.statSync(dir).isDirectory());
  } catch {
    return false;
  }
}

function shellDesktop() {
  try {
    const out = execSync(
      "powershell -NoProfile -Command \"[Environment]::GetFolderPath('Desktop')\"",
      { encoding: "utf8", windowsHide: true }
    );
    return out.trim() || null;
  } catch {
    return null;
  }
}

/** Все папки, где ищем PDF/MP4 */
export function getSearchRoots(sourceMode, slug, extraDir) {
  const user = process.env.USERPROFILE ?? "";
  const roots = [];

  if (extraDir) roots.push(path.resolve(extraDir));

  roots.push(
    path.join(projectRoot, "sources", "pozharka"),
    path.join(projectRoot, "sources", "pozharka", slug ?? "")
  );

  const desktopCandidates = [
    shellDesktop(),
    process.env.PUBLIC ?? null,
    path.join(user, "OneDrive", "Рабочий стол"),
    path.join(user, "Desktop"),
    path.join(user, "OneDrive", "Desktop"),
    "C:\\Users\\Windows\\OneDrive\\Рабочий стол",
  ].filter(Boolean);

  for (const desktop of desktopCandidates) {
    roots.push(desktop);
    roots.push(path.join(desktop, "База данных"));
  }

  roots.push(path.join(user, "Downloads"));

  if (sourceMode === "bazadata") {
    return [...new Set(roots.filter((r) => existsDir(r) && r.includes("База данных")))];
  }

  if (sourceMode === "desktop") {
    return [...new Set(roots.filter(existsDir))];
  }

  return [...new Set(roots.filter(existsDir))];
}

export function normalizeBaseName(name) {
  return name
    .toLowerCase()
    .replace(/[«»""„"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function listFiles(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isFile());
  } catch {
    return [];
  }
}

/** Точное имя, затем похожее (без учёта регистра и кавычек) */
export function findSourceFile(baseName, ext, sourceMode, slug, extraDir) {
  const exactName = `${baseName}${ext}`;
  const normTarget = normalizeBaseName(baseName);
  const roots = getSearchRoots(sourceMode, slug, extraDir);

  for (const dir of roots) {
    const exact = path.join(dir, exactName);
    if (fs.existsSync(exact)) return exact;
  }

  for (const dir of roots) {
    for (const entry of listFiles(dir)) {
      if (!entry.name.toLowerCase().endsWith(ext.toLowerCase())) continue;
      const stem = entry.name.slice(0, -ext.length);
      if (normalizeBaseName(stem) === normTarget) {
        return path.join(dir, entry.name);
      }
    }
  }

  const keywords = normTarget.split(" ").filter((w) => w.length >= 5);
  if (keywords.length >= 3) {
    let best = null;
    let bestScore = 0;
    for (const dir of roots) {
      for (const entry of listFiles(dir)) {
        if (!entry.name.toLowerCase().endsWith(ext.toLowerCase())) continue;
        const normFile = normalizeBaseName(entry.name);
        const score = keywords.filter((k) => normFile.includes(k)).length;
        if (score > bestScore && score >= Math.ceil(keywords.length * 0.6)) {
          bestScore = score;
          best = path.join(dir, entry.name);
        }
      }
    }
    if (best) return best;
  }

  return null;
}

export function formatSearchReport(baseName, ext, sourceMode, slug, extraDir) {
  const roots = getSearchRoots(sourceMode, slug, extraDir);
  const lines = [
    `Файл не найден: ${baseName}${ext}`,
    `Режим: ${sourceMode}`,
    "",
    "Проверенные папки:",
    ...roots.map((r) => `  • ${r}`),
  ];

  const hints = [];
  for (const dir of roots) {
    for (const entry of listFiles(dir)) {
      const lower = entry.name.toLowerCase();
      if (lower.endsWith(".pdf") || lower.endsWith(".mp4")) {
        if (
          normalizeBaseName(entry.name).includes(
            normalizeBaseName(baseName).slice(0, 20)
          )
        ) {
          hints.push(path.join(dir, entry.name));
        }
      }
    }
  }

  if (hints.length) {
    lines.push("", "Похожие файлы:");
    for (const h of [...new Set(hints)].slice(0, 8)) lines.push(`  → ${h}`);
  } else {
    lines.push(
      "",
      "На рабочем столе и в sources/pozharka/ нет подходящих PDF/MP4.",
      "Положите файлы в одну из папок выше или в:",
      `  ${path.join(projectRoot, "sources", "pozharka")}`
    );
  }

  return lines.join("\n");
}
