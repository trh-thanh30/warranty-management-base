import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import test from "node:test";

const directorySource = readFileSync(
  new URL(
    "./components/contact-submissions-directory-card.tsx",
    import.meta.url,
  ),
  "utf8",
);
const listViewSource = readFileSync(
  new URL("./contact-submissions.view.tsx", import.meta.url),
  "utf8",
);
const detailViewPath = new URL(
  "./contact-submission-detail.view.tsx",
  import.meta.url,
);
const detailSource = readFileSync(detailViewPath, "utf8");
const viMessages = JSON.parse(
  readFileSync(new URL("../../messages/vi.json", import.meta.url), "utf8"),
) as Record<string, unknown>;
const enMessages = JSON.parse(
  readFileSync(new URL("../../messages/en.json", import.meta.url), "utf8"),
) as Record<string, unknown>;
const detailPagePath = new URL(
  "../../../app/[locale]/(dashboard)/contact-submissions/[submissionId]/page.tsx",
  import.meta.url,
);

test("contact submission status controls only render allowed transitions", () => {
  assert.match(directorySource, /getAllowedContactSubmissionTransitions/);
  assert.match(directorySource, /ContactSubmissionStatusBadge/);
  assert.match(directorySource, /DropdownMenuSub/);
  assert.match(directorySource, /DropdownMenuSubTrigger/);
  assert.match(directorySource, /DropdownMenuSubContent/);
  assert.match(directorySource, /t\("actions\.changeStatus"\)/);
  assert.match(directorySource, /RefreshCw/);
  assert.match(directorySource, /ContactSubmissionStatusIcon/);
  assert.doesNotMatch(directorySource, /ContactSubmissionStatusControl/);
  assert.doesNotMatch(
    directorySource,
    /Object\.entries\(CONTACT_SUBMISSION_STATUS_LABELS\)/,
  );
});

test("contact submission directory exposes consultation topic and province", () => {
  assert.match(directorySource, /directory\.consultationTopic/);
  assert.match(directorySource, /directory\.province/);
  assert.match(directorySource, /submission\.consultationTopic/);
  assert.match(directorySource, /submission\.provinceName/);
});

test("contact submission detail exposes phone, update time and error state", () => {
  assert.match(detailSource, /Table/);
  assert.match(detailSource, /TableRow/);
  assert.match(detailSource, /actions=\{/);
  assert.match(detailSource, /href=\{`tel:\$\{submission\.phone\}`\}/);
  assert.match(detailSource, /submission\.updatedAt/);
  assert.match(detailSource, /submission\.consultationTopic/);
  assert.match(detailSource, /submission\.provinceName/);
  assert.match(detailSource, /detail\.consultationTopic/);
  assert.match(detailSource, /detail\.province/);
  assert.match(detailSource, /isError/);
  assert.match(detailSource, /onUpdateStatus/);
  assert.doesNotMatch(detailSource, /DetailItem/);
  assert.doesNotMatch(
    detailSource,
    /ContactSubmissionDetailRow label=\{t\("detail\.status"\)\}/,
  );
  assert.doesNotMatch(
    detailSource,
    /rounded-md border border-slate-200 bg-slate-50 p-3/,
  );
});

test("contact submission detail opens as a route instead of a dialog", () => {
  assert.ok(existsSync(detailPagePath));
  assert.match(
    directorySource,
    /href=\{`\/contact-submissions\/\$\{submission\.id\}`\}/,
  );
  assert.doesNotMatch(listViewSource, /ContactSubmissionDetailDialog/);
  assert.doesNotMatch(detailSource, /DialogContent/);
});

test("contact submission copy exists in both admin locales", () => {
  assert.ok(viMessages.ContactSubmissions);
  assert.ok(enMessages.ContactSubmissions);
});
