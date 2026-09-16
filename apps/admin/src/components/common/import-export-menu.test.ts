import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("import/export menu animates both directions without hiding keyboard focus", async () => {
  const source = await readFile(
    new URL("./import-export-menu.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /group-data-\[state=open\]:rotate-180/);
  assert.match(source, /data-\[state=open\]:animate-in/);
  assert.match(source, /data-\[state=closed\]:animate-out/);
  assert.match(source, /motion-reduce:animate-none/);
  assert.match(source, /outline-none/);
  assert.match(source, /focus-visible:outline-none/);
  assert.match(source, /<Button[\s\S]*variant="secondary"/);
});
