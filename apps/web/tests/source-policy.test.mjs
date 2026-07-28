import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import assert from "node:assert/strict";

const repoRoot = process.cwd();
const webRoot = path.join(repoRoot, "apps", "web");
const sourceRoots = [path.join(webRoot, "app"), path.join(webRoot, "src")];

const textExtensions = new Set([".ts", ".tsx", ".css"]);
const sourceExtensions = new Set([".ts", ".tsx"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if ([".next", "node_modules"].includes(entry.name)) {
        continue;
      }
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function existingFiles(roots, extensions) {
  const files = [];

  for (const root of roots) {
    try {
      const rootStat = await stat(root);
      if (!rootStat.isDirectory()) {
        continue;
      }
      const rootFiles = await walk(root);
      files.push(
        ...rootFiles.filter((file) => extensions.has(path.extname(file))),
      );
    } catch {
      // Optional source roots may not exist in stripped fixtures.
    }
  }

  return files;
}

function relative(file) {
  return path.relative(repoRoot, file).replaceAll(path.sep, "/");
}

async function readSources(extensions = textExtensions) {
  const files = await existingFiles(sourceRoots, extensions);
  return Promise.all(
    files.map(async (file) => ({
      file,
      relativePath: relative(file),
      content: await readFile(file, "utf8"),
    })),
  );
}

function collectMatches(sources, regex) {
  const matches = [];

  for (const source of sources) {
    const lines = source.content.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (regex.test(line)) {
        matches.push(`${source.relativePath}:${index + 1}: ${line.trim()}`);
      }
      regex.lastIndex = 0;
    });
  }

  return matches;
}

test("web source does not use heavy font-weight utilities", async () => {
  const sources = await readSources();
  const matches = collectMatches(sources, /\bfont-(?:bold|extrabold|black)\b/g);

  assert.deepEqual(matches, []);
});

test("web source does not use arbitrary pixel/rem font-size utilities", async () => {
  const sources = await readSources();
  const matches = collectMatches(sources, /\btext-\[[0-9.]+(?:px|rem)\]/g);

  assert.deepEqual(matches, []);
});

test("route page files stay as thin server components", async () => {
  const pageFiles = (
    await existingFiles([path.join(webRoot, "app")], sourceExtensions)
  ).filter((file) => path.basename(file) === "page.tsx");

  const violations = [];

  for (const file of pageFiles) {
    const content = await readFile(file, "utf8");
    const importsView = /from\s+["']@\/src\/views\//.test(content);
    const hasClientDirective = /^\s*["']use client["'];/m.test(content);
    const hasStateHook =
      /\buse(?:State|Effect|Memo|Callback|Reducer|Ref)\b/.test(content);

    if (!importsView || hasClientDirective || hasStateHook) {
      violations.push(relative(file));
    }
  }

  assert.deepEqual(violations, []);
});

test("web source avoids ad-hoc Tailwind palette colors for brand UI", async () => {
  const sources = await readSources(new Set([".ts", ".tsx"]));
  const forbiddenPalette =
    /\b(?:bg|text|border|hover:bg|hover:text|focus:border)-(?:yellow|amber|red|emerald|green|blue|purple|pink|orange|slate|stone|gray|zinc|neutral)-(?:[0-9]{2,3})(?:\/[0-9]{1,3})?\b/g;
  const allowLine = ["category-icons.tsx", "fill=", "stroke="];

  const matches = collectMatches(sources, forbiddenPalette).filter(
    (line) => !allowLine.some((allowed) => line.includes(allowed)),
  );

  assert.deepEqual(matches, []);
});

test("about page follows the FUJITEK red brand system", async () => {
  const aboutViewPath = path.join(
    webRoot,
    "src",
    "views",
    "about",
    "about.view.tsx",
  );
  const aboutConstantsPath = path.join(
    webRoot,
    "src",
    "views",
    "about",
    "about.constants.ts",
  );
  const viMessagesPath = path.join(webRoot, "src", "messages", "vi.json");
  const enMessagesPath = path.join(webRoot, "src", "messages", "en.json");
  const content = await Promise.all([
    readFile(aboutViewPath, "utf8"),
    readFile(aboutConstantsPath, "utf8"),
    readFile(viMessagesPath, "utf8"),
    readFile(enMessagesPath, "utf8"),
  ]).then((parts) => parts.join("\n"));

  const violations = [
    /\bBLACK LABEL(?: FILMS)?\b/i,
    /\bBlack Label\b/i,
    /\baccent-gold\b/,
    /\b(?:yellow|amber)-[0-9]{2,3}\b/,
    /#FFC400\b/i,
    /rgba\(255,\s*196,\s*0,/i,
  ]
    .filter((pattern) => pattern.test(content))
    .map((pattern) => pattern.source);

  assert.deepEqual(violations, []);
});

test("about page keeps the prototype parallax and compass triggers", async () => {
  const aboutView = await readFile(
    path.join(webRoot, "src", "views", "about", "about.view.tsx"),
    "utf8",
  );

  assert.match(
    aboutView,
    /window\.addEventListener\("mousemove", handlePointerMove\)/,
  );
  assert.doesNotMatch(aboutView, /onMouseMove=\{handleHeroMouseMove\}/);
  assert.match(aboutView, /whileInView=\{\{ rotate: 0 \}\}/);
  assert.match(aboutView, /whileHover="hover"/);
  assert.match(aboutView, /variants=\{aboutCompassNeedleVariants\}/);
  assert.match(aboutView, /\banimate-marquee-left\b/);
  assert.doesNotMatch(aboutView, /animate-\[marquee_/);
  assert.doesNotMatch(aboutView, /compassHovered/);
});

test("about messages resolve every key used by the route", async () => {
  const messages = await Promise.all(
    ["vi", "en"].map(async (locale) => ({
      locale,
      value: JSON.parse(
        await readFile(
          path.join(webRoot, "src", "messages", `${locale}.json`),
          "utf8",
        ),
      ).AboutPage,
    })),
  );
  const staticKeys = [
    "metadata.title",
    "metadata.description",
    "hero.eyebrow",
    "hero.titlePrefix",
    "hero.titleHighlight",
    "hero.titleSuffix",
    "hero.description",
    "hero.imageAlt",
    "hero.brandLabel",
    "hero.originLabel",
    "hero.productLabel",
    "hero.scrollCue",
    "hero.stats.uvIr",
    "hero.stats.uvIrValue",
    "hero.stats.origin",
    "hero.stats.originValue",
    "hero.stats.technology",
    "hero.stats.technologyValue",
    "sectionRails.intro",
    "sectionRails.anatomy",
    "sectionRails.origin",
    "sectionRails.coreTech",
    "sectionRails.performance",
    "sectionRails.safety",
    "sectionRails.audience",
    "sectionRails.vision",
    "intro.eyebrow",
    "intro.title",
    "intro.mainTag",
    "intro.pullquote",
    "intro.p1",
    "intro.p2",
    "filmLayers.eyebrow",
    "filmLayers.title",
    "filmLayers.instruction",
    "origin.eyebrow",
    "origin.title",
    "origin.badgeValue",
    "origin.badgeLabel",
    "origin.p1",
    "origin.p2",
    "coreTech.title",
    "coreTech.eyebrow",
    "coreTech.subtitle",
    "coreTech.sputtering.title",
    "coreTech.sputtering.description",
    "coreTech.sputtering.b1",
    "coreTech.sputtering.b2",
    "coreTech.nanoCeramic.title",
    "coreTech.nanoCeramic.description",
    "coreTech.nanoCeramic.b1",
    "coreTech.nanoCeramic.b2",
    "stats.uvIr",
    "stats.origin",
    "stats.coreTech",
    "stats.signal",
    "performance.eyebrow",
    "performance.title",
    "performance.imageAlt",
    "performance.imageCaption",
    "safety.eyebrow",
    "safety.title",
    "safety.description",
    "safety.imageAlt",
    "safety.imageCaption",
    "safety.b1",
    "safety.b2",
    "safety.b3",
    "safety.footerNote",
    "customerValue.eyebrow",
    "customerValue.headline",
    "customerValue.description",
    "customerValue.imageAlt",
    "customerValue.imageCaption",
    "customerValue.b1",
    "customerValue.b2",
    "customerValue.b3",
    "customerValue.footerNote",
    "vision.eyebrow",
    "vision.headline",
    "vision.p1",
    "vision.p2",
    "labels.contact",
  ];
  const timelineKeys = ["research", "production", "qualityControl"].flatMap(
    (id) => [
      `origin.timeline.${id}.title`,
      `origin.timeline.${id}.description`,
    ],
  );
  const layerKeys = [
    "scratchCoat",
    "sputterMetal",
    "opticalBase",
    "nanoCeramic",
    "adhesive",
  ].flatMap((id) => [
    `filmLayers.items.${id}.title`,
    `filmLayers.items.${id}.description`,
  ]);
  const performanceKeys = ["cool", "uvProtect", "glare", "energy"].flatMap(
    (id) => [
      `performance.items.${id}.title`,
      `performance.items.${id}.description`,
    ],
  );
  const keys = [
    ...staticKeys,
    ...timelineKeys,
    ...layerKeys,
    ...performanceKeys,
  ];
  const missing = messages.flatMap(({ locale, value }) =>
    keys
      .filter(
        (key) =>
          key
            .split(".")
            .reduce((current, segment) => current?.[segment], value) ===
          undefined,
      )
      .map((key) => `${locale}:${key}`),
  );

  assert.deepEqual(missing, []);
});

test("web TSX does not hardcode Vietnamese UI copy", async () => {
  const sources = await readSources(new Set([".tsx"]));
  const vietnameseOrMojibake =
    /[À-ỹĐđ]|(?:Ã|Ä|á|â|Æ|Ê|Ô|Ơ|Ư|€|œ|™|º|»|¼|½|¾|¿)/;
  const matches = collectMatches(sources, vietnameseOrMojibake).filter(
    (line) => {
      const trimmed = line.trim();
      return (
        !trimmed.startsWith("//") &&
        !trimmed.includes("/*") &&
        !trimmed.includes("*/")
      );
    },
  );

  assert.deepEqual(matches, []);
});

test("Vietnamese and English message files keep matching key paths", async () => {
  const vi = JSON.parse(
    await readFile(path.join(webRoot, "src", "messages", "vi.json"), "utf8"),
  );
  const en = JSON.parse(
    await readFile(path.join(webRoot, "src", "messages", "en.json"), "utf8"),
  );

  function keys(value, prefix = "") {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return [prefix];
    }

    return Object.entries(value).flatMap(([key, child]) =>
      keys(child, prefix ? `${prefix}.${key}` : key),
    );
  }

  assert.deepEqual(keys(vi).sort(), keys(en).sort());
});

test("product views consume one shared catalog source", async () => {
  const sharedCatalogPath = path.join(
    webRoot,
    "src",
    "constants",
    "product-catalog.constants.ts",
  );
  const consumers = [
    path.join(webRoot, "src", "views", "home", "home.constants.ts"),
    path.join(webRoot, "src", "views", "products", "products.constants.ts"),
    path.join(
      webRoot,
      "src",
      "views",
      "product-detail",
      "product-detail.view.tsx",
    ),
  ];

  const catalog = await readFile(sharedCatalogPath, "utf8").catch(() => "");
  const contents = await Promise.all(
    consumers.map((file) => readFile(file, "utf8")),
  );

  assert.match(catalog, /export const productCatalog/);
  assert.deepEqual(
    consumers
      .filter(
        (_, index) => !contents[index].includes("product-catalog.constants"),
      )
      .map(relative),
    [],
  );
});

test("locale layout owns a shared site footer outside Home", async () => {
  const layout = await readFile(
    path.join(webRoot, "app", "[locale]", "layout.tsx"),
    "utf8",
  );
  const footer = await readFile(
    path.join(webRoot, "src", "components", "layout", "site-footer.tsx"),
    "utf8",
  ).catch(() => "");

  assert.match(layout, /components\/layout\/site-footer/);
  assert.doesNotMatch(layout, /views\/home\/components\/cta-section/);
  assert.match(footer, /export function SiteFooter/);
});

test("motion viewport policies have explicit once and repeat contracts", async () => {
  const motionConstants = await readFile(
    path.join(webRoot, "src", "constants", "motion.constants.ts"),
    "utf8",
  );
  const revealHook = await readFile(
    path.join(webRoot, "src", "hooks", "use-scroll-reveal.ts"),
    "utf8",
  );

  assert.match(motionConstants, /revealViewportOnce[\s\S]*once:\s*true/);
  assert.match(motionConstants, /revealViewportRepeat[\s\S]*once:\s*false/);
  assert.doesNotMatch(revealHook, /export const viewportOnce/);
});

test("web does not keep a parallel custom slider abstraction", async () => {
  const sliderPath = path.join(webRoot, "src", "hooks", "use-slider.ts");
  const sliderExists = await stat(sliderPath)
    .then(() => true)
    .catch(() => false);

  assert.equal(sliderExists, false);
});

test("web form controls share one focus style source", async () => {
  const sources = await readSources(sourceExtensions);
  const focusRecipe =
    "focus:border-premium-red focus-visible:border-premium-red focus-visible:ring-0 focus-visible:ring-offset-0";
  const declarations = sources.filter((source) =>
    source.content.includes(focusRecipe),
  );

  assert.deepEqual(
    declarations.map((source) => source.relativePath),
    ["apps/web/src/components/common/form-control.constants.ts"],
  );
});

test("@repo/hooks build produces the Turbo-declared dist artifact", async () => {
  const packageJson = JSON.parse(
    await readFile(
      path.join(repoRoot, "packages", "hooks", "package.json"),
      "utf8",
    ),
  );

  assert.match(packageJson.scripts.build, /write-build-marker\.mjs/);
});

test("frontend Docker builds retain root build helpers after Turbo prune", async () => {
  for (const app of ["web", "admin"]) {
    const dockerfile = await readFile(
      path.join(repoRoot, "apps", app, "Dockerfile"),
      "utf8",
    );

    assert.match(
      dockerfile,
      /COPY --from=pruner \/app\/scripts \.\/scripts[\s\S]*RUN pnpm --filter @repo\/(?:web|admin)\.\.\. build/,
      `${app} Dockerfile must copy root build helpers before package builds run`,
    );
  }
});

test("container ports match the production ports documented for deployment", async () => {
  const ports = { api: 4100, web: 4101, admin: 4102 };

  for (const [app, port] of Object.entries(ports)) {
    const dockerfile = await readFile(
      path.join(repoRoot, "apps", app, "Dockerfile"),
      "utf8",
    );

    assert.match(dockerfile, new RegExp(`ENV PORT=${port}`));
    assert.doesNotMatch(dockerfile, /EXPOSE 300[012]/);
    assert.match(dockerfile, new RegExp(`EXPOSE ${port}`));
  }
});
