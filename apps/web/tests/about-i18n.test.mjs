import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const webRoot = path.join(process.cwd(), "apps", "web");
const aboutDir = path.join(webRoot, "src", "views", "about");

function flattenKeys(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (child && typeof child === "object" && !Array.isArray(child)) {
      return flattenKeys(child, nextKey);
    }

    return [nextKey];
  });
}

test("about view and subcomponents keep visible copy and image descriptions in i18n", async () => {
  const componentsDir = path.join(aboutDir, "components");
  const componentFiles = (await readdir(componentsDir)).map((f) =>
    path.join(componentsDir, f),
  );
  const allFiles = [path.join(aboutDir, "about.view.tsx"), ...componentFiles];

  for (const filePath of allFiles) {
    const content = await readFile(filePath, "utf8");
    const vietnameseCopy = content
      .split(/\r?\n/)
      .flatMap((line, index) =>
        /[À-ỹĐđ]/.test(line)
          ? [`${path.basename(filePath)}:${index + 1}: ${line.trim()}`]
          : [],
      );

    assert.deepEqual(vietnameseCopy, []);
    assert.doesNotMatch(content, /\balt=["'][^"']+["']/);
  }
});

test("about message schemas stay identical for vi and en", async () => {
  const messages = await Promise.all(
    ["vi", "en"].map(
      async (locale) =>
        JSON.parse(
          await readFile(
            path.join(webRoot, "src", "messages", `${locale}.json`),
            "utf8",
          ),
        ).AboutPage,
    ),
  );
  const [viKeys, enKeys] = messages.map((message) =>
    flattenKeys(message).sort(),
  );

  assert.deepEqual(viKeys, enKeys);
});
