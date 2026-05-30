/**
 * Копирует «Наши объекты.pdf» с рабочего стола и конвертирует страницы в PNG.
 * Запуск: npm run our-objects
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pdf } from "pdf-to-img";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const assetDir = path.join(rootDir, "public", "our-objects");
const imageDir = path.join(assetDir, "images");
const pdfDest = path.join(assetDir, "nashi-obekty.pdf");
const manifestPath = path.join(rootDir, "data", "our-objects.json");

const SOURCE_FILE = "Наши объекты.pdf";

const SOURCE_PATHS = [
  path.join(process.env.USERPROFILE ?? "", "OneDrive", "Рабочий стол", SOURCE_FILE),
  path.join(process.env.USERPROFILE ?? "", "Desktop", SOURCE_FILE),
  path.join(process.env.USERPROFILE ?? "", "OneDrive", "Desktop", SOURCE_FILE),
];

function findSourcePdf() {
  return SOURCE_PATHS.find((p) => fs.existsSync(p));
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

async function convertPdfToImages(pdfPath) {
  clearDir(imageDir);
  const imageUrls = [];
  let pageNum = 1;
  const document = await pdf(pdfPath, { scale: 2 });

  for await (const image of document) {
    const filename = `${pageNum}.png`;
    fs.writeFileSync(path.join(imageDir, filename), image);
    imageUrls.push(`/our-objects/images/${filename}`);
    pageNum++;
  }

  return imageUrls;
}

if (!fs.existsSync(assetDir)) fs.mkdirSync(assetDir, { recursive: true });

const sourcePdf = findSourcePdf();
if (!sourcePdf) {
  console.error("PDF не найден. Ожидался один из путей:");
  SOURCE_PATHS.forEach((p) => console.error(" ", p));
  process.exit(1);
}

console.log("Источник:", sourcePdf);
fs.copyFileSync(sourcePdf, pdfDest);
console.log("[PDF] →", pdfDest);

try {
  const imageUrls = await convertPdfToImages(pdfDest);
  const manifest = {
    pdfUrl: "/our-objects/nashi-obekty.pdf",
    imageUrls,
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log("[IMG]", imageUrls.length, "стр. →", imageDir);
  console.log("[OK] Манифест:", manifestPath);
} catch (err) {
  console.error("[ERR]", err instanceof Error ? err.message : err);
  process.exit(1);
}
