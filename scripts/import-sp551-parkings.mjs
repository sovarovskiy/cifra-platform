/**
 * Импорт PDF и MP4 статьи «Подземные паркинги и СП 551» из папки «База данных» на рабочем столе.
 * Запуск: npm run sp551-parkings
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pdf } from "pdf-to-img";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const assetDir = path.join(rootDir, "public", "pozharka", "sp551-parkings");
const imageDir = path.join(assetDir, "images");
const pdfDest = path.join(assetDir, "sp551-parkings.pdf");
const videoDest = path.join(assetDir, "video.mp4");
const manifestPath = path.join(rootDir, "data", "pozharka-sp551-parkings.json");

const BASE_NAME =
  "Подземные паркинги и электромобили что меняет СП 551";
const PDF_NAME = `${BASE_NAME}.pdf`;
const MP4_NAME = `${BASE_NAME}.mp4`;

const DESKTOP_DIRS = [
  path.join(process.env.USERPROFILE ?? "", "OneDrive", "Рабочий стол", "База данных"),
  path.join(process.env.USERPROFILE ?? "", "Desktop", "База данных"),
  path.join(process.env.USERPROFILE ?? "", "OneDrive", "Desktop", "База данных"),
  "C:\\Users\\Windows\\OneDrive\\Рабочий стол\\База данных",
];

function findFile(name) {
  for (const dir of DESKTOP_DIRS) {
    const full = path.join(dir, name);
    if (fs.existsSync(full)) return full;
  }
  return null;
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
    imageUrls.push(`/pozharka/sp551-parkings/images/${filename}`);
    pageNum++;
  }

  return imageUrls;
}

fs.mkdirSync(assetDir, { recursive: true });

const sourcePdf = findFile(PDF_NAME);
const sourceMp4 = findFile(MP4_NAME);

if (!sourcePdf) {
  console.error("PDF не найден. Ожидался файл:");
  DESKTOP_DIRS.forEach((d) => console.error(" ", path.join(d, PDF_NAME)));
  process.exit(1);
}

console.log("[PDF] источник:", sourcePdf);
fs.copyFileSync(sourcePdf, pdfDest);
console.log("[PDF] →", pdfDest);

let videoUrl = "/pozharka/sp551-parkings/video.mp4";
if (sourceMp4) {
  console.log("[MP4] источник:", sourceMp4);
  fs.copyFileSync(sourceMp4, videoDest);
  console.log("[MP4] →", videoDest);
} else {
  console.warn("[skip] MP4 не найден:", MP4_NAME);
  videoUrl = "";
}

try {
  const imageUrls = await convertPdfToImages(pdfDest);
  const manifest = {
    pdfUrl: "/pozharka/sp551-parkings/sp551-parkings.pdf",
    videoUrl: videoUrl || null,
    imageUrls,
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log("[IMG]", imageUrls.length, "стр.");
  console.log("[OK] Манифест:", manifestPath);
} catch (err) {
  console.error("[ERR]", err instanceof Error ? err.message : err);
  process.exit(1);
}
