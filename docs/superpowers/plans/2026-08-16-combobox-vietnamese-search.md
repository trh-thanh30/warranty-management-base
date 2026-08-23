# Combobox Vietnamese Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Admin comboboxes find visible Vietnamese labels with accented or unaccented partial queries while preserving ID/code values.

**Architecture:** Add a pure search normalizer and `cmdk` filter beside the shared Combobox, then make string item children automatic search keywords. The shared component remains responsible for client-side filtering; paginated API searches remain unchanged.

**Tech Stack:** TypeScript, React 19, cmdk 1.1.1, Node test runner, tsx.

## Global Constraints

- Preserve each `ComboboxItem.value` as the submitted ID/code.
- Do not add a new dependency.
- Support Vietnamese diacritics, `Đ/đ`, case-insensitive matching, partial labels, and code matching.
- Do not change customer, product, or dealer API search behavior.
- Execute inline and sequentially; do not use subagents or parallel tasks.

---

### Task 1: Shared Vietnamese Combobox Filter

**Files:**

- Create: `apps/admin/src/components/common/combobox.utils.ts`
- Create: `apps/admin/src/components/common/combobox.utils.test.ts`

**Interfaces:**

- Produces: `normalizeComboboxSearch(value: string): string`
- Produces: `filterComboboxItem(value: string, search: string, keywords?: string[]): number`

- [ ] **Step 1: Write the failing unit tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { filterComboboxItem, normalizeComboboxSearch } from "./combobox.utils";

test("normalizes Vietnamese text for case-insensitive search", () => {
  assert.equal(normalizeComboboxSearch("Thành Phố Hà Nội"), "thanh pho ha noi");
  assert.equal(normalizeComboboxSearch("Đồng Nai"), "dong nai");
});

test("matches visible labels with accented and unaccented partial queries", () => {
  assert.equal(filterComboboxItem("1", "Hà Nội", ["Thành phố Hà Nội"]), 1);
  assert.equal(filterComboboxItem("1", "ha noi", ["Thành phố Hà Nội"]), 1);
  assert.equal(filterComboboxItem("1", "noi", ["Thành phố Hà Nội"]), 1);
});

test("keeps code search and rejects unrelated terms", () => {
  assert.equal(filterComboboxItem("1", "1", ["Thành phố Hà Nội"]), 1);
  assert.equal(filterComboboxItem("1", "Đà Nẵng", ["Thành phố Hà Nội"]), 0);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm --dir apps/admin exec tsx --test src/components/common/combobox.utils.test.ts
```

Expected: FAIL because `combobox.utils` does not exist.

- [ ] **Step 3: Implement the pure filter**

```ts
export function normalizeComboboxSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export function filterComboboxItem(
  value: string,
  search: string,
  keywords: string[] = [],
) {
  const normalizedSearch = normalizeComboboxSearch(search);
  if (!normalizedSearch) return 1;

  const searchableText = normalizeComboboxSearch(
    [value, ...keywords].join(" "),
  );
  return searchableText.includes(normalizedSearch) ? 1 : 0;
}
```

- [ ] **Step 4: Run the targeted test and verify GREEN**

Run:

```bash
pnpm --dir apps/admin exec tsx --test src/components/common/combobox.utils.test.ts
```

Expected: 3 tests pass, 0 fail.

- [ ] **Step 5: Commit the tested filter**

```bash
git add apps/admin/src/components/common/combobox.utils.ts apps/admin/src/components/common/combobox.utils.test.ts
git commit -m "feat(admin): add Vietnamese combobox filter"
```

### Task 2: Connect Visible Labels to cmdk Filtering

**Files:**

- Modify: `apps/admin/src/components/common/combobox.tsx`
- Create: `apps/admin/src/components/common/combobox.test.ts`

**Interfaces:**

- Consumes: `filterComboboxItem(value, search, keywords)` from Task 1.
- Produces: `ComboboxItem({ children, keywords?, value })`, where string children are automatically searchable aliases.

- [ ] **Step 1: Write the failing integration contract test**

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./combobox.tsx", import.meta.url), "utf8");

test("Combobox uses the shared Vietnamese filter", () => {
  assert.match(source, /filter=\{filterComboboxItem\}/);
});

test("ComboboxItem sends visible string labels to cmdk as keywords", () => {
  assert.match(source, /keywords=\{searchKeywords\}/);
  assert.match(source, /typeof children === "string"/);
});
```

- [ ] **Step 2: Run the contract test and verify RED**

Run:

```bash
pnpm --dir apps/admin exec tsx --test src/components/common/combobox.test.ts
```

Expected: 2 assertion failures because the filter and keywords are not wired.

- [ ] **Step 3: Wire the filter and visible text keywords**

Import `filterComboboxItem`. Pass `filter={filterComboboxItem}` to `CommandPrimitive`. Extend `ComboboxItem` with `keywords?: string[]`, derive:

```ts
const searchKeywords =
  typeof children === "string" ? [children, ...(keywords ?? [])] : keywords;
```

Then pass `keywords={searchKeywords}` to `CommandPrimitive.Item`. Keep `value` and `onSelect` unchanged.

- [ ] **Step 4: Run targeted tests and Admin verification**

Run sequentially:

```bash
pnpm --dir apps/admin exec tsx --test src/components/common/combobox.utils.test.ts src/components/common/combobox.test.ts
pnpm --filter @repo/admin test
pnpm --filter @repo/admin check-types
pnpm --filter @repo/admin lint
```

Expected: all commands exit 0; Admin tests report 0 failures.

- [ ] **Step 5: Commit the shared component integration**

```bash
git add apps/admin/src/components/common/combobox.tsx apps/admin/src/components/common/combobox.test.ts
git commit -m "fix(admin): search comboboxes by Vietnamese labels"
```
