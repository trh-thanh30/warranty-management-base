import { spawnSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const adminRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const testFiles = await findTestFiles(path.join(adminRoot, "src"));

if (testFiles.length === 0) {
  console.error("No admin test files were found.");
  process.exit(1);
}

console.log(`Running ${testFiles.length} admin test files...`);

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", ...testFiles],
  {
    cwd: adminRoot,
    stdio: "inherit",
  },
);

process.exit(result.status ?? 1);

async function findTestFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return findTestFiles(entryPath);
      return isTestFile(entry.name) ? [entryPath] : [];
    }),
  );

  return files.flat().sort();
}

function isTestFile(filename) {
  return /\.(?:test|spec)\.(?:ts|tsx)$/.test(filename);
}
