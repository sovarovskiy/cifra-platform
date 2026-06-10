/**
 * Копирует SVG-логотип в public/icons/ (запуск: npm run icons).
 * PNG для PWA генерируются динамически в app/icon.tsx и app/apple-icon.tsx.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "icons");
const srcSvg = path.join(root, "public", "brand-logo.svg");

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.copyFileSync(srcSvg, path.join(outDir, "brand-logo.svg"));
console.log("[OK] public/icons/brand-logo.svg — PWA PNG: /icon и /apple-icon");
