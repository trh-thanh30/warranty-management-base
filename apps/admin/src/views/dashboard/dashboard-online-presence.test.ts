import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("dashboard attaches separate online badges to the operations eyebrow", () => {
  const view = readFileSync(
    new URL("./dashboard.view.tsx", import.meta.url),
    "utf8",
  );
  assert.match(view, /eyebrowAddon={<DashboardOnlinePresence \/>}/);
  const badges = readFileSync(
    new URL("./components/dashboard-online-presence.tsx", import.meta.url),
    "utf8",
  );
  assert.match(badges, /\["web", "admin"\]/);
  assert.match(badges, /query\.isError \|\| !query\.data/);
  assert.match(badges, /unavailable \? "—"/);
  assert.match(badges, /flex-wrap/);
});

test("online badges have matching Vietnamese and English labels", () => {
  for (const locale of ["vi", "en"]) {
    const messages = JSON.parse(
      readFileSync(
        new URL(`../../messages/${locale}.json`, import.meta.url),
        "utf8",
      ),
    );
    assert.equal(messages.Dashboard.presence.web, "Web");
    assert.equal(messages.Dashboard.presence.admin, "Admin");
    assert.match(messages.Dashboard.presence.online, /{source}.*{count}/);
    assert.ok(messages.Dashboard.presence.description);
    assert.ok(messages.Dashboard.presence.unavailable);
  }
});

test("online counts and Admin heartbeats reuse the analytics service", () => {
  const service = readFileSync(
    new URL("../../services/analytics/analytics.service.ts", import.meta.url),
    "utf8",
  );
  assert.match(service, /\/analytics\/presence\/admin\/heartbeat/);
  assert.match(service, /\/analytics\/presence\/online/);
  const hook = readFileSync(
    new URL("./hooks/use-online-presence.ts", import.meta.url),
    "utf8",
  );
  assert.match(hook, /queryFn: analyticsService\.onlinePresence/);
});
