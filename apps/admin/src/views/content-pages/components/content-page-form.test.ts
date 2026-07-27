import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./content-page-form.tsx", import.meta.url),
  "utf8",
);
const faqEditorSource = readFileSync(
  new URL("./content-page-faq-items-editor.tsx", import.meta.url),
  "utf8",
);

test("content page summary uses a multiline textarea", () => {
  assert.match(
    source,
    /<Textarea[\s\S]*?id="content-page-summary"[\s\S]*?rows=\{4\}/,
  );
});

test("content page rich-text editor enables document import", () => {
  assert.match(
    source,
    /<RichTextEditor[\s\S]*?maxLength=\{20_000\}[\s\S]*?onImportDocument=\{[\s\S]*?value=\{field\.value\}/,
  );
});

test("FAQ editor uses structured question items instead of heading parsing", () => {
  assert.match(source, /const kind = form\.watch\("kind"\)/);
  assert.match(source, /kind === "FAQ"/);
  assert.match(source, /<ContentPageFaqItemsEditor[\s\S]*?form=\{form\}/);
  assert.doesNotMatch(source, /faqEditorHint/);
});

test("FAQ items use drag and drop and persist order through the API", () => {
  assert.match(faqEditorSource, /<DndContext/);
  assert.match(faqEditorSource, /<SortableContext/);
  assert.match(faqEditorSource, /useSortable/);
  assert.match(faqEditorSource, /reorderFaqItems\.mutateAsync\(persistedIds\)/);
  assert.match(faqEditorSource, /toast\.success\(t\("faqReorderSuccess"\)\)/);
  assert.doesNotMatch(
    faqEditorSource,
    /ArrowUp|ArrowDown|faqMoveUp|faqMoveDown/,
  );
});

test("each FAQ card can collapse without unmounting its form", () => {
  assert.match(faqEditorSource, /const \[isExpanded, setIsExpanded\]/);
  assert.match(faqEditorSource, /aria-expanded=\{isExpanded\}/);
  assert.match(faqEditorSource, /hidden=\{!isExpanded\}/);
});
