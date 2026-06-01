import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "data", "test-import");

const sources = [
  path.join(process.env.USERPROFILE ?? "", "OneDrive", "Рабочий стол", "1.csv"),
  path.join(process.env.USERPROFILE ?? "", "OneDrive", "Рабочий стол", "2.csv"),
  path.join(process.env.USERPROFILE ?? "", "OneDrive", "Рабочий стол", "3.csv"),
];

fs.mkdirSync(outDir, { recursive: true });

for (let i = 0; i < sources.length; i++) {
  const src = sources[i];
  const dest = path.join(outDir, `${i + 1}.csv`);
  if (!fs.existsSync(src)) {
    console.warn(`[skip] нет файла: ${src}`);
    continue;
  }
  fs.copyFileSync(src, dest);
  console.log(`[OK] ${dest}`);
}

if (!fs.existsSync(path.join(outDir, "1.csv"))) {
  console.error("CSV не скопированы. Положите 1.csv, 2.csv, 3.csv в data/test-import/");
  process.exit(1);
}
