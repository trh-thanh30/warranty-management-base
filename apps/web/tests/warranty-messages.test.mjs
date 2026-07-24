import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const webRoot = path.join(process.cwd(), "apps", "web");

const getPath = (value, keyPath) =>
  keyPath.split(".").reduce((current, key) => current?.[key], value);

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
