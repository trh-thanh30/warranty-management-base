import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const scriptPath = path.join(
  process.cwd(),
  "scripts",
  "check-deployment-endpoints.sh",
);

function runHealthcheck(env = {}) {
  return spawnSync("bash", [scriptPath], {
    encoding: "utf8",
    env: {
      ...process.env,
      CURL_BIN: "true",
      DEPLOY_ADMIN_URL: "",
      DEPLOY_API_HEALTH_URL: "",
      DEPLOY_WEB_URL: "",
      ...env,
    },
  });
}

test("deployment healthcheck trims surrounding whitespace from endpoint secrets", () => {
  const result = runHealthcheck({
    DEPLOY_WEB_URL: "  \r\nhttps://baohanh.lexzenz.com\r\n  ",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /DEPLOY_WEB_URL passed/);
});

test("deployment healthcheck identifies the malformed endpoint secret", () => {
  const malformedUrl = "DEPLOY_WEB_URL=https://baohanh.lexzenz.com";
  const result = runHealthcheck({ DEPLOY_WEB_URL: malformedUrl });

  assert.equal(result.status, 2);
  assert.match(
    result.stderr,
    /DEPLOY_WEB_URL must be an absolute HTTP\(S\) URL/,
  );
  assert.doesNotMatch(result.stderr, new RegExp(malformedUrl));
});

test("deployment healthcheck skips cleanly when no endpoint is configured", () => {
  const result = runHealthcheck();

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /No deployment endpoint secrets configured/);
});
