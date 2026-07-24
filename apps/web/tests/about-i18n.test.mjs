import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const webRoot = path.join(process.cwd(), "apps", "web");
const aboutViewPath = path.join(
  webRoot,
  "src",
  "views",
  "about",
  "about.view.tsx",
);

function flattenKeys(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (child && typeof child === "object" && !Array.isArray(child)) {
      return flattenKeys(child, nextKey);
    }

    return [nextKey];
  });
}

test("about view keeps visible copy and image descriptions in i18n", async () => {
  const content = await readFile(aboutViewPath, "utf8");
  const vietnameseCopy = content
    .split(/\r?\n/)
    .flatMap((line, index) =>
      /[À-ỹĐđ]/.test(line) ? [`${index + 1}: ${line.trim()}`] : [],
    );

  assert.deepEqual(vietnameseCopy, []);
  assert.doesNotMatch(content, /\balt=["'][^"']+["']/);
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

test("about origin stat renders a decorative Japanese flag without emoji", async () => {
  const content = await readFile(aboutViewPath, "utf8");

  assert.match(content, /data-about-origin-flag/);
  assert.match(
    content,
    /data-about-origin-flag[\s\S]*?aria-hidden="true"[\s\S]*?bg-premium-red/,
  );
  assert.doesNotMatch(content, /🇯🇵/u);
});
