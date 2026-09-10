import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULT_WEBSITE_HOMEPAGE_CONTENT } from "@repo/shared/constants";
import { EditableText, HomepageRenderer } from "../src/index.ts";

test("renders the eight homepage sections in their fixed order", () => {
  const html = renderToStaticMarkup(
    <HomepageRenderer
      copy={DEFAULT_WEBSITE_HOMEPAGE_CONTENT.vi.landing}
      heroImageUrl="/hero.jpg"
    />,
  );
  const ids = [
    "hero",
    "brand-heritage",
    "core-tech",
    "milestones",
    "pillars",
    "network",
    "testimonials",
    "b2b",
  ];
  const positions = ids.map((id) =>
    html.indexOf(`data-homepage-section="${id}"`),
  );
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(
    positions,
    [...positions].sort((a, b) => a - b),
  );
});

test("maps editable text through approved style classes only", () => {
  const html = renderToStaticMarkup(
    <EditableText
      as="h2"
      value={{
        align: "center",
        bold: true,
        color: "primary",
        content: "Styled title",
        font: "heading",
        italic: false,
        size: "2xl",
      }}
    />,
  );

  assert.match(html, /text-premium-red/);
  assert.match(html, /text-center/);
  assert.match(html, /font-heading/);
  assert.match(html, /font-bold/);
  assert.doesNotMatch(html, /#ff00ff|72px|Comic Sans/);
});
