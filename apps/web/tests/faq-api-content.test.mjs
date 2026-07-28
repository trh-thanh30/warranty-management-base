import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("home FAQ reads structured API items without parsing content HTML", () => {
  const homeSource = readFileSync(
    new URL("../src/views/home/home.view.tsx", import.meta.url),
    "utf8",
  );
  const faqSource = readFileSync(
    new URL("../src/views/home/components/faq-section.tsx", import.meta.url),
    "utf8",
  );
  const constantsSource = readFileSync(
    new URL("../src/views/home/home.constants.ts", import.meta.url),
    "utf8",
  );

  assert.match(homeSource, /getPublishedContentPage\(FAQ_CONTENT_PAGE_SLUG\)/);
  assert.match(faqSource, /page\?\.faqItems\.filter/);
  assert.match(faqSource, /__html: item\.answer/);
  assert.doesNotMatch(faqSource, /parseFaqContent/);
  assert.doesNotMatch(constantsSource, /faqItems/);
});
