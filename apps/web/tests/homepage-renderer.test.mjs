import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const homeViewPath = "src/views/about/about.view.tsx";

test("public homepage uses the canonical renderer without Puck", async () => {
  const homeView = await readFile(homeViewPath, "utf8");

  assert.match(
    homeView,
    /import \{ HomepageRenderer \} from "@repo\/homepage"/,
  );
  assert.doesNotMatch(homeView, /@puckeditor\/core/);
  assert.doesNotMatch(homeView, /AboutPageRenderer/);
});
