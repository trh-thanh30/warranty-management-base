import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const requiredFiles = [
  "public/index.html",
  "public/app.js",
  "public/content/modules.json",
  "public/content/overview.md",
  "public/content/api-contracts.md",
  "public/content/frontend-guide.md",
];

for (const file of requiredFiles) {
  const url = new URL(`../${file}`, import.meta.url);
  await access(url);
}

const modulesUrl = new URL("../public/content/modules.json", import.meta.url);
const modules = JSON.parse(await readFile(modulesUrl, "utf8"));

if (!Array.isArray(modules) || modules.length === 0) {
  throw new Error(
    "public/content/modules.json must contain at least one module.",
  );
}

for (const moduleItem of modules) {
  if (!moduleItem.id || !moduleItem.title || !moduleItem.file) {
    throw new Error("Each docs module needs id, title, and file.");
  }

  await access(
    fileURLToPath(
      new URL(`../public/content/${moduleItem.file}`, import.meta.url),
    ),
  );
}

console.log("Docs static files are valid.");
