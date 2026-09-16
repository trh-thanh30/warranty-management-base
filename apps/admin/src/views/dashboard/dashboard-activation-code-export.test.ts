import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("activation code dashboard exports the active report date range", async () => {
  const [dashboardSource, operationsSource] = await Promise.all([
    readFile(new URL("./hooks/use-dashboard.ts", import.meta.url), "utf8"),
    readFile(
      new URL(
        "./components/dashboard-activation-code-operations.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);

  assert.match(
    dashboardSource,
    /dateFrom: toDashboardDateBoundary\(range\.from, "start"\)/,
  );
  assert.match(
    dashboardSource,
    /dateTo: toDashboardDateBoundary\(range\.to, "end"\)/,
  );
  assert.match(operationsSource, /useDashboardActivationCodeReportExport/);
  assert.match(operationsSource, /exportMutation\.mutate\(\)/);
  assert.match(operationsSource, /disabled=\{exportMutation\.isPending\}/);
});
