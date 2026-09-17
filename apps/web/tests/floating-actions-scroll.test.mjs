import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const webSource = path.join(process.cwd(), "apps", "web", "src");

test("both floating actions use the same 50px scroll boundary", async () => {
  const [constants, footer, quickChat] = await Promise.all([
    readFile(
      path.join(webSource, "constants", "floating-actions.constants.ts"),
      "utf8",
    ),
    readFile(
      path.join(webSource, "components", "layout", "site-footer.tsx"),
      "utf8",
    ),
    readFile(
      path.join(webSource, "components", "common", "public-quick-chat.tsx"),
      "utf8",
    ),
  ]);

  assert.match(constants, /FLOATING_ACTIONS_SCROLL_THRESHOLD = 50\b/);

  for (const source of [footer, quickChat]) {
    assert.match(source, /window\.scrollY > FLOATING_ACTIONS_SCROLL_THRESHOLD/);
  }

  assert.match(
    footer,
    /toggleVisibility\(\);\s*window\.addEventListener\("scroll"/,
  );
  assert.match(
    quickChat,
    /updateTriggerVisibility\(\);\s*window\.addEventListener\("scroll"/,
  );
});
