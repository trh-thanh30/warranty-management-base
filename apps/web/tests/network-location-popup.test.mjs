import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const webRoot = path.join(process.cwd(), "apps", "web");
const popupPath = path.join(
  webRoot,
  "src",
  "components",
  "common",
  "network-location-popup.tsx",
);
const mapPaths = [
  path.join(
    webRoot,
    "src",
    "views",
    "about",
    "components",
    "about-network-map.tsx",
  ),
  path.join(webRoot, "src", "views", "dealers", "components", "dealer-map.tsx"),
];

test("About and Dealers maps share one network-location popup component", async () => {
  const [popupSource, ...mapSources] = await Promise.all([
    readFile(popupPath, "utf8"),
    ...mapPaths.map((mapPath) => readFile(mapPath, "utf8")),
  ]);

  assert.match(popupSource, /export function NetworkLocationPopup/);
  assert.match(popupSource, /from "@repo\/ui\/badge"/);
  assert.match(popupSource, /from "react-leaflet"/);
  assert.match(popupSource, /location\.kind === "DEALER"/);
  assert.match(popupSource, /location\.address/);
  assert.match(popupSource, /location\.phone/);
  assert.match(popupSource, /location\.googleMapsUrl/);

  for (const source of mapSources) {
    assert.match(source, /@\/src\/components\/common\/network-location-popup/);
    assert.match(source, /<NetworkLocationPopup/);
    assert.doesNotMatch(source, /<Popup/);
    assert.doesNotMatch(source, /\bPopup\b.*from "react-leaflet"/);
  }
});
