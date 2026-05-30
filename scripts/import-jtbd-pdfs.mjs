/**
 * Копирует PDF с рабочего стола и конвертирует страницы в PNG.
 * Запуск: npm run jtbd-pdfs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pdf } from "pdf-to-img";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const pdfOutDir = path.join(rootDir, "public", "jtbd", "pdfs");
const imageRootDir = path.join(rootDir, "public", "jtbd", "images");
const manifestPath = path.join(rootDir, "data", "jtbd-images.json");

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

function clearDir(dir) {
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir)) {
      fs.unlinkSync(path.join(dir, file));
    }
  } else {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function convertPdfToImages(pdfPath, segmentId) {
  const outImageDir = path.join(imageRootDir, segmentId);
  clearDir(outImageDir);

  const pages = [];
  let pageNum = 1;
  const document = await pdf(pdfPath, { scale: 2 });

  for await (const image of document) {
    const filename = `${pageNum}.png`;
    fs.writeFileSync(path.join(outImageDir, filename), image);
    pages.push(`/jtbd/images/${segmentId}/${filename}`);
    pageNum++;
  }

  return pages;
}

if (!fs.existsSync(pdfOutDir)) fs.mkdirSync(pdfOutDir, { recursive: true });
if (!fs.existsSync(imageRootDir)) fs.mkdirSync(imageRootDir, { recursive: true });

const sourceDir = findSourceDir();
if (!sourceDir) {
  console.error("Папка с PDF не найдена. Ожидалась одна из:");
  SOURCE_DIRS.forEach((d) => console.error(" ", d));
  process.exit(1);
}

console.log("Источник:", sourceDir);
console.log("PDF →", pdfOutDir);
console.log("Картинки →", imageRootDir);

const manifest = {};
let copied = 0;

for (const [id, srcName] of Object.entries(PDF_MAP)) {
  const src = path.join(sourceDir, srcName);
  const dest = path.join(pdfOutDir, `${id}.pdf`);

  if (!fs.existsSync(src)) {
    console.warn("[!] Нет файла:", srcName);
    manifest[id] = [];
    continue;
  }

  fs.copyFileSync(src, dest);
  console.log("[PDF]", srcName);

  try {
    const pages = await convertPdfToImages(dest, id);
    manifest[id] = pages;
    console.log("[IMG]", id, "—", pages.length, "стр.");
    copied++;
  } catch (err) {
    console.error("[ERR]", id, err instanceof Error ? err.message : err);
    manifest[id] = [];
  }
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log("\nМанифест:", manifestPath);
console.log(`Готово: ${copied} из ${Object.keys(PDF_MAP).length} сегментов`);
if (copied === 0) process.exit(1);
