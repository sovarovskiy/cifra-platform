import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const keyPaths = [
  path.join(process.env.USERPROFILE ?? "", "OneDrive", "Рабочий стол", "cifra-platform-16933-f8680f58a8dd.json"),
  path.join(process.env.USERPROFILE ?? "", "Desktop", "cifra-platform-16933-f8680f58a8dd.json"),
  "C:\\Users\\Windows\\OneDrive\\Рабочий стол\\cifra-platform-16933-f8680f58a8dd.json",
];

const keyPath = keyPaths.find((p) => fs.existsSync(p));
if (!keyPath) {
  console.error("JSON-ключ не найден");
  process.exit(1);
}

const creds = JSON.parse(fs.readFileSync(keyPath, "utf8"));
const envPath = path.join(root, ".env");
const base = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8").trim() : "";

const out = `${base}\nGOOGLE_SERVICE_ACCOUNT_JSON=${JSON.stringify(creds)}\n`;
fs.writeFileSync(path.join(root, ".env.local"), out, "utf8");

console.log("[OK] .env.local создан");
console.log("Service account:", creds.client_email);
