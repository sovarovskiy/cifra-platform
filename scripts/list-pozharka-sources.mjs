/**
 * Показать, где лежат PDF/MP4 для статей Обучения.
 * npm run pozharka-sources
 */
import fs from "fs";
import path from "path";
import {
  findSourceFile,
  getSearchRoots,
  projectRoot,
} from "./pozharka-source-paths.mjs";

const articles = [
  {
    slug: "fire-services-bundle",
    name: "Как собрать несколько услуг пожарной безопасности в один проект",
  },
  {
    slug: "evac-plan-standard",
    name: "Почему одного стандартного плана эвакуации часто недостаточно",
  },
];

console.log("Папки поиска (desktop):\n");
for (const dir of getSearchRoots("desktop")) {
  console.log(" ", dir);
}

console.log("\n---\n");

for (const { slug, name } of articles) {
  console.log(slug);
  const pdf = findSourceFile(name, ".pdf", "desktop", slug);
  const mp4 = findSourceFile(name, ".mp4", "desktop", slug);
  console.log("  PDF:", pdf ?? "НЕ НАЙДЕН");
  console.log("  MP4:", mp4 ?? "не найден (необязательно)");
  const imported = path.join(
    projectRoot,
    "public",
    "pozharka",
    slug,
    "images",
    "1.png"
  );
  console.log("  Импорт:", fs.existsSync(imported) ? "уже в public/" : "нет");
  console.log("");
}
