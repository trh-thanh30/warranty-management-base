import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const webRoot = path.join(process.cwd(), "apps", "web");

const getPath = (value, keyPath) =>
  keyPath.split(".").reduce((current, key) => current?.[key], value);

const collectMessageKeyPaths = (value, parentPath = "", paths = new Set()) => {
  if (Array.isArray(value)) {
    const arrayPath = `${parentPath}[]`;
    paths.add(arrayPath);
    for (const item of value) {
      collectMessageKeyPaths(item, arrayPath, paths);
    }
    return paths;
  }

  if (!value || typeof value !== "object") return paths;

  for (const [key, child] of Object.entries(value)) {
    const keyPath = parentPath ? `${parentPath}.${key}` : key;
    paths.add(keyPath);
    collectMessageKeyPaths(child, keyPath, paths);
  }

  return paths;
};

const collectMessageText = (value) => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(collectMessageText).join(" ");
  if (!value || typeof value !== "object") return "";
  return Object.values(value).map(collectMessageText).join(" ");
};

test("every warranty action resolves all card messages in every locale", async () => {
  const actionsSource = await readFile(
    path.join(webRoot, "src", "views", "warranty", "warranty.constants.ts"),
    "utf8",
  );
  const actionIds = [...actionsSource.matchAll(/id:\s*"([^"]+)"/g)].map(
    ([, id]) => id,
  );
  const requiredFields = ["badge", "title", "description", "action"];
  const missing = [];

  for (const locale of ["vi", "en"]) {
    const messages = JSON.parse(
      await readFile(
        path.join(webRoot, "src", "messages", `${locale}.json`),
        "utf8",
      ),
    );

    for (const actionId of actionIds) {
      for (const field of requiredFields) {
        const keyPath = `Warranty.actions.items.${actionId}.${field}`;
        if (typeof getPath(messages, keyPath) !== "string") {
          missing.push(`${locale}:${keyPath}`);
        }
      }
    }
  }

  assert.deepEqual(missing, []);
});

test("warranty policy card links to the dedicated warranty-return policy", async () => {
  const actionsSource = await readFile(
    path.join(webRoot, "src", "views", "warranty", "warranty.constants.ts"),
    "utf8",
  );
  const policyAction = actionsSource.match(
    /id:\s*"policy"[\s\S]*?href:\s*APP_ROUTES\.([A-Za-z]+)/,
  );

  assert.equal(policyAction?.[1], "policyWarrantyReturn");
});

test("every warranty subpage shares the locale-aware warranty page shell", async () => {
  const [componentSource, shellSource] = await Promise.all([
    readFile(
      path.join(
        webRoot,
        "src",
        "views",
        "warranty",
        "components",
        "warranty-back-link.tsx",
      ),
      "utf8",
    ),
    readFile(
      path.join(
        webRoot,
        "src",
        "views",
        "warranty",
        "components",
        "warranty-service-page-shell.tsx",
      ),
      "utf8",
    ),
  ]);
  const subpageFiles = [
    "activate.view.tsx",
    "lookup.view.tsx",
    "request.view.tsx",
    "track.view.tsx",
  ];

  assert.match(componentSource, /href=\{APP_ROUTES\.warranty\}/);
  assert.match(componentSource, /useTranslations\("Warranty"\)/);
  assert.match(shellSource, /<WarrantyBackLink\s*\/>/);

  for (const filename of subpageFiles) {
    const source = await readFile(
      path.join(webRoot, "src", "views", "warranty", filename),
      "utf8",
    );

    assert.match(source, /<WarrantyServicePageShell(?:\s|\/|>)/, filename);
  }

  for (const [locale, expectedLabel] of [
    ["vi", "Quay lại bảo hành"],
    ["en", "Back to warranty"],
  ]) {
    const messages = JSON.parse(
      await readFile(
        path.join(webRoot, "src", "messages", `${locale}.json`),
        "utf8",
      ),
    );

    assert.equal(messages.Warranty.backToWarranty, expectedLabel);
  }
});

test("public warranty terminology distinguishes every customer-facing code", async () => {
  const [vi, en, lookupViewSource] = await Promise.all([
    readFile(path.join(webRoot, "src", "messages", "vi.json"), "utf8").then(
      JSON.parse,
    ),
    readFile(path.join(webRoot, "src", "messages", "en.json"), "utf8").then(
      JSON.parse,
    ),
    readFile(
      path.join(webRoot, "src", "views", "warranty", "lookup.view.tsx"),
      "utf8",
    ),
  ]);

  assert.deepEqual(
    [...collectMessageKeyPaths(vi)].sort(),
    [...collectMessageKeyPaths(en)].sort(),
    "VI and EN message files must expose the same key structure",
  );

  for (const messages of [vi, en]) {
    const allPublicText = collectMessageText(messages);
    const activateText = collectMessageText(messages.Warranty.activate);
    const lookupText = collectMessageText(messages.Warranty.lookup);
    const requestText = collectMessageText(messages.Warranty.request);
    const trackText = collectMessageText(messages.Warranty.track);

    assert.doesNotMatch(allPublicText, /E-Warranty|e-warranty|FJ-/);
    assert.match(activateText, /SP-/);
    assert.doesNotMatch(activateText, /WM-|CLM-/);
    assert.match(lookupText, /WM-/);
    assert.doesNotMatch(lookupText, /SP-|FJ-/);
    assert.match(requestText, /WM-/);
    assert.match(requestText, /CLM/);
    assert.match(trackText, /WAR-/);
    assert.match(trackText, /CLM-/);
  }

  assert.doesNotMatch(lookupViewSource, /E-Warranty|Serial Number|FJ-/);
  assert.match(lookupViewSource, /registration\.methods\.serial\.title/);
});

test("warranty claim form offers shared issue choices for every product category", async () => {
  const [vi, en, sharedSource] = await Promise.all([
    readFile(path.join(webRoot, "src", "messages", "vi.json"), "utf8").then(
      JSON.parse,
    ),
    readFile(path.join(webRoot, "src", "messages", "en.json"), "utf8").then(
      JSON.parse,
    ),
    readFile(
      path.join(
        process.cwd(),
        "packages",
        "shared",
        "src",
        "constants",
        "warranty-domain.ts",
      ),
      "utf8",
    ),
  ]);
  const expectedIssueKeys = [
    "bubble",
    "fade",
    "scratch",
    "noPower",
    "intermittentOperation",
    "weakOrWrongLight",
    "moisture",
    "noRecording",
    "poorVideoQuality",
    "storageFailure",
    "connectionFailure",
    "inaccurateReading",
    "lowSensorBattery",
    "other",
  ];

  assert.deepEqual(
    Object.keys(vi.Warranty.request.fields.issue.options),
    expectedIssueKeys,
  );
  assert.deepEqual(
    Object.keys(en.Warranty.request.fields.issue.options),
    expectedIssueKeys,
  );

  const sharedOptions = sharedSource.match(
    /WARRANTY_CLAIM_ISSUE_OPTIONS\s*=\s*\[([\s\S]*?)\]\s*as const/,
  )?.[1];
  assert.ok(sharedOptions, "shared warranty claim issue options must exist");
  assert.deepEqual(
    [...sharedOptions.matchAll(/"([^"]+)"/g)].map(([, key]) => key),
    expectedIssueKeys,
  );
});
