import { spawnSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const webRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const workspaceRoot = path.resolve(webRoot, "../..");
const testFiles = await findTestFiles(path.join(webRoot, "tests"));
const require = createRequire(import.meta.url);
const tsxLoader = pathToFileURL(require.resolve("tsx")).href;

if (testFiles.length === 0) {
  process.stderr.write("No Web test files were found.\n");
  process.exit(1);
}

process.stdout.write(`Running ${testFiles.length} Web test files...\n`);

const result = spawnSync(
  process.execPath,
  ["--import", tsxLoader, "--test", ...testFiles],
  {
    cwd: workspaceRoot,
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
  return /\.(?:test|spec)\.mjs$/.test(filename);
}
