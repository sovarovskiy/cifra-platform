/**
 * Импорт статьи «Пожарка / Обучение»: PDF → PNG + текст, MP4, манифесты.
 *
 * node scripts/import-pozharka-article.mjs <slug> "<имя файла без расширения>" [desktop|bazadata]
 *   [--pdf="C:\path\file.pdf"] [--mp4="C:\path\file.mp4"] [--source-dir="C:\folder"]
 *   [--rewrite-article] [--skip-if-imported]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pdf } from "pdf-to-img";
import {
  findSourceFile,
  formatSearchReport,
} from "./pozharka-source-paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith("--"));
const positional = args.filter((a) => !a.startsWith("--"));

const slug = positional[0];
const baseName = positional[1];
const sourceMode = positional[2] ?? "desktop";
const rewriteArticle = flags.includes("--rewrite-article");
const skipIfImported = flags.includes("--skip-if-imported");

function flagValue(name) {
  const hit = flags.find((f) => f.startsWith(`${name}=`));
  return hit ? hit.slice(name.length + 1).replace(/^"|"$/g, "") : null;
}

const pdfOverride = flagValue("--pdf");
const mp4Override = flagValue("--mp4");
const sourceDir = flagValue("--source-dir");

if (!slug || !baseName) {
  console.error(
    'Usage: node scripts/import-pozharka-article.mjs <slug> "<base name>" [desktop|bazadata] [--pdf=...] [--mp4=...] [--source-dir=...]'
  );
  process.exit(1);
}

const PDF_NAME = `${baseName}.pdf`;
const MP4_NAME = `${baseName}.mp4`;

const assetDir = path.join(rootDir, "public", "pozharka", slug);
const imageDir = path.join(assetDir, "images");
const pdfDest = path.join(assetDir, `${slug}.pdf`);
const videoDest = path.join(assetDir, "video.mp4");
const manifestPath = path.join(rootDir, "data", `pozharka-${slug}.json`);
const articlePath = path.join(rootDir, "data", `pozharka-${slug}-article.json`);
const publicPrefix = `/pozharka/${slug}`;

function isAlreadyImported() {
  const firstImage = path.join(imageDir, "1.png");
  return fs.existsSync(pdfDest) && fs.existsSync(firstImage);
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

async function convertPdfToImages(pdfPath, imageDir, publicPrefix) {
  clearDir(imageDir);
  const imageUrls = [];
  let pageNum = 1;
  const document = await pdf(pdfPath, { scale: 2 });

  for await (const image of document) {
    const filename = `${pageNum}.png`;
    fs.writeFileSync(path.join(imageDir, filename), image);
    imageUrls.push(`${publicPrefix}/images/${filename}`);
    pageNum++;
  }

  return imageUrls;
}

async function extractArticleBlocks(pdfPath) {
  try {
    const { PDFParse } = await import("pdf-parse");
    const buf = fs.readFileSync(pdfPath);
    const parser = new PDFParse({ data: buf });
    const result = await parser.getText();
    const raw = (result.text ?? "").replace(/\r/g, "").trim();
    if (!raw) return [];

    const paragraphs = raw
      .split(/\n{2,}/)
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter((s) => s.length > 40);

    return paragraphs.map((text) => ({ type: "p", text }));
  } catch (err) {
    console.warn(
      "[warn] Текст из PDF не извлечён:",
      err instanceof Error ? err.message : err
    );
    return [
      {
        type: "p",
        text: "Текст статьи будет доступен после повторного импорта с установленным пакетом pdf-parse (npm install). Пока используйте страницы PDF ниже.",
      },
    ];
  }
}

fs.mkdirSync(assetDir, { recursive: true });

if (skipIfImported && isAlreadyImported()) {
  console.log("[skip] уже импортировано:", assetDir);
  process.exit(0);
}

const sourcePdf =
  pdfOverride && fs.existsSync(pdfOverride)
    ? pdfOverride
    : findSourceFile(baseName, ".pdf", sourceMode, slug, sourceDir);

const sourceMp4 =
  mp4Override && fs.existsSync(mp4Override)
    ? mp4Override
    : findSourceFile(baseName, ".mp4", sourceMode, slug, sourceDir);

if (!sourcePdf) {
  console.error(formatSearchReport(baseName, ".pdf", sourceMode, slug, sourceDir));
  process.exit(1);
}

console.log("[PDF] источник:", sourcePdf);
fs.copyFileSync(sourcePdf, pdfDest);

let videoUrl = `${publicPrefix}/video.mp4`;
if (sourceMp4) {
  console.log("[MP4] источник:", sourceMp4);
  fs.copyFileSync(sourceMp4, videoDest);
} else {
  console.warn("[skip] MP4 не найден:", MP4_NAME);
  videoUrl = null;
}

try {
  const imageUrls = await convertPdfToImages(pdfDest, imageDir, publicPrefix);
  const manifest = {
    pdfUrl: `${publicPrefix}/${slug}.pdf`,
    videoUrl,
    imageUrls,
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log("[IMG]", imageUrls.length, "стр.");
  console.log("[OK]", manifestPath);

  if (rewriteArticle) {
    const blocks = await extractArticleBlocks(pdfDest);
    const article = { blocks, relatedTopics: [] };
    fs.writeFileSync(articlePath, `${JSON.stringify(article, null, 2)}\n`, "utf8");
    console.log("[TXT]", blocks.length, "блоков →", articlePath);
  } else if (fs.existsSync(articlePath)) {
    console.log("[skip] текст статьи не меняем:", articlePath);
  } else {
    const blocks = await extractArticleBlocks(pdfDest);
    const article = { blocks, relatedTopics: [] };
    fs.writeFileSync(articlePath, `${JSON.stringify(article, null, 2)}\n`, "utf8");
    console.log("[TXT]", blocks.length, "блоков (новый файл)");
  }
} catch (err) {
  console.error("[ERR]", err instanceof Error ? err.message : err);
  process.exit(1);
}
