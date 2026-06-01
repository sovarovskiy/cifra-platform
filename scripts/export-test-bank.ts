import fs from "fs";
import path from "path";
import { buildTestQuestionBankManifest } from "../lib/test-questions-generator";

const out = path.join(process.cwd(), "data", "test-questions.json");
const manifest = buildTestQuestionBankManifest();
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`[OK] ${manifest.totalInBank} questions → ${out}`);
