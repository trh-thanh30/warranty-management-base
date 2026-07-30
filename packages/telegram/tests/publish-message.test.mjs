import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import process from "node:process";
import test from "node:test";

test("renders a build and push notification for published images", () => {
  const output = execFileSync(
    process.execPath,
    [
      "dist/cli.js",
      "--dry-run",
      "--event",
      "publish",
      "--status",
      "success",
      "--project",
      "warranty-management-base",
      "--environment",
      "ghcr.io",
      "--channel",
      "main",
      "--branch",
      "main",
      "--commit",
      "1a8fbc1d00000000000000000000000000000000",
      "--message",
      "api, api-migrator, web, admin",
      "--author",
      "trh-thanh30",
      "--run-url",
      "https://github.com/example/actions/runs/1",
    ],
    { encoding: "utf8" },
  );

  assert.match(output, /✅ Build &amp; Push Images Success/);
  assert.match(output, /<b>Registry:<\/b> ghcr\.io/);
  assert.match(output, /<b>Channel:<\/b> <code>main<\/code>/);
  assert.match(output, /<b>Images:<\/b> api, api-migrator, web, admin/);
  assert.doesNotMatch(output, /Deploy Success/);
});
