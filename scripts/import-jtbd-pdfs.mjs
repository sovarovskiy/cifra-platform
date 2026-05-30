/**
 * Копирует PDF с рабочего стола в public/jtbd/pdfs/
 * Запуск: npm run jtbd-pdfs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "jtbd", "pdfs");

const PDF_MAP = {
  "A-01": "A-01 деловой.pdf",
  "B-0": "B-0 деловой.pdf",
  "B-03": "B-03 деловой.pdf",
  "C-0": "C-0 деловой.pdf",
  "C-02": "C-02 деловой.pdf",
  "E-04": "E-04 деловой.pdf",
  "E-05": "E-05 деловой.pdf",
};

const SOURCE_DIRS = [
  path.join(process.env.USERPROFILE ?? "", "OneDrive", "Рабочий стол", "JTBD в картинках"),
  path.join(process.env.USERPROFILE ?? "", "Desktop", "JTBD в картинках"),
  path.join(process.env.USERPROFILE ?? "", "OneDrive", "Desktop", "JTBD в картинках"),
];

function findSourceDir() {
  return SOURCE_DIRS.find((dir) => fs.existsSync(dir));
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const sourceDir = findSourceDir();
if (!sourceDir) {
  console.error("Папка с PDF не найдена. Ожидалась одна из:");
  SOURCE_DIRS.forEach((d) => console.error(" ", d));
  process.exit(1);
}

console.log("Источник:", sourceDir);
console.log("Назначение:", outDir);

let copied = 0;
for (const [id, srcName] of Object.entries(PDF_MAP)) {
  const src = path.join(sourceDir, srcName);
  const dest = path.join(outDir, `${id}.pdf`);
  if (!fs.existsSync(src)) {
    console.warn("[!] Нет файла:", srcName);
    continue;
  }
  fs.copyFileSync(src, dest);
  console.log("[OK]", srcName, "→", `${id}.pdf`);
  copied++;
}

console.log(`\nСкопировано: ${copied} из ${Object.keys(PDF_MAP).length}`);
if (copied === 0) process.exit(1);
