import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
execSync("npx --yes tsx scripts/export-test-bank.ts", {
  cwd: root,
  stdio: "inherit",
});
