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

test("web source reserves the heaviest font weights for the design system", async () => {
  const sources = await readSources();
  const matches = collectMatches(sources, /\bfont-(?:extrabold|black)\b/g);

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

test("Next 15 registers locale routing through middleware entrypoints", async () => {
  for (const app of ["web", "admin"]) {
    const middleware = await readFile(
      path.join(repoRoot, "apps", app, "middleware.ts"),
      "utf8",
    );

    assert.match(middleware, /next-intl\/middleware/);
    assert.match(middleware, /export const config/);
  }
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

test("about page composes the current corporate sections", async () => {
  const aboutView = await readFile(
    path.join(webRoot, "src", "views", "about", "about.view.tsx"),
    "utf8",
  );
  const sections = [
    "AboutHeroCorporate",
    "AboutBrandHeritage",
    "AboutCoreTech",
    "AboutTimeline",
    "AboutVisionValues",
    "AboutNetworkBanner",
    "AboutTestimonials",
    "AboutB2BCta",
  ];

  for (const section of sections) {
    assert.match(aboutView, new RegExp(`<${section}(?:\\s|/|>)`));
  }

  assert.doesNotMatch(aboutView, /window\.addEventListener\("mousemove"/);
});

test("about messages keep the current corporate route contract", async () => {
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
  const keys = ["metadata.title", "metadata.description"];
  const requiredSections = [
    "hero",
    "brandHeritage",
    "coreTech",
    "milestones",
    "pillars",
    "network",
    "testimonials",
    "b2bCta",
  ];
  const missing = messages.flatMap(({ locale, value }) =>
    [
      ...keys.filter(
        (key) =>
          key
            .split(".")
            .reduce((current, segment) => current?.[segment], value) ===
          undefined,
      ),
      ...requiredSections.filter(
        (section) => !value?.[section] || typeof value[section] !== "object",
      ),
    ].map((key) => `${locale}:${key}`),
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

test("product listing and detail use the public products API", async () => {
  const sharedCatalogPath = path.join(
    webRoot,
    "src",
    "constants",
    "product-catalog.constants.ts",
  );
  const productsViewPath = path.join(
    webRoot,
    "src",
    "views",
    "products",
    "products.view.tsx",
  );
  const productsServicePath = path.join(
    webRoot,
    "src",
    "services",
    "products",
    "products.service.ts",
  );
  const productDetailPath = path.join(
    webRoot,
    "src",
    "views",
    "product-detail",
    "product-detail.view.tsx",
  );

  const catalog = await readFile(sharedCatalogPath, "utf8").catch(() => "");
  const [productsView, productsService, productDetail] = await Promise.all([
    readFile(productsViewPath, "utf8"),
    readFile(productsServicePath, "utf8"),
    readFile(productDetailPath, "utf8"),
  ]);

  assert.match(catalog, /export const productCatalog/);
  assert.match(productsView, /useProductsCatalog/);
  assert.doesNotMatch(productsView, /product-catalog\.constants/);
  assert.match(productsService, /"\/public\/products"/);
  assert.match(
    productsService,
    /`\/public\/products\/\$\{encodeURIComponent\(slug\)\}`/,
  );
  assert.match(productDetail, /productsService\.getProductDetail/);
  assert.doesNotMatch(productDetail, /product-catalog\.constants/);
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

test("frontend runtimes retain patched framework and image-processing dependencies", async () => {
  const rootPackage = JSON.parse(
    await readFile(path.join(repoRoot, "package.json"), "utf8"),
  );
  for (const app of ["web", "admin"]) {
    const [appPackage, dockerfile] = await Promise.all([
      readFile(path.join(repoRoot, "apps", app, "package.json"), "utf8").then(
        JSON.parse,
      ),
      readFile(path.join(repoRoot, "apps", app, "Dockerfile"), "utf8"),
    ]);
    assert.equal(
      appPackage.dependencies.next,
      "15.5.25",
      `${app} must use the patched Next.js 15.5.25 backport`,
    );
    assert.match(
      dockerfile,
      /rm -rf \/usr\/local\/lib\/node_modules\/npm \/usr\/local\/lib\/node_modules\/corepack/,
      `${app} runtime must not retain npm or Corepack`,
    );
  }

  assert.equal(rootPackage.pnpm?.overrides?.["next@15.5.25>sharp"], "0.35.0");
});

test("frontend images bake the public API URL into browser bundles", async () => {
  for (const app of ["web", "admin"]) {
    const dockerfile = await readFile(
      path.join(repoRoot, "apps", app, "Dockerfile"),
      "utf8",
    );

    assert.match(
      dockerfile,
      /ARG NEXT_PUBLIC_API_URL[\s\S]*ENV NEXT_PUBLIC_API_URL=\$NEXT_PUBLIC_API_URL[\s\S]*RUN pnpm --filter @repo\/(?:web|admin)\.\.\. build/,
      `${app} Dockerfile must expose NEXT_PUBLIC_API_URL before the Next.js build`,
    );
  }

  const publishWorkflow = await readFile(
    path.join(repoRoot, ".github", "workflows", "publish-images.yml"),
    "utf8",
  );
  const buildArgMatches =
    publishWorkflow.match(
      /NEXT_PUBLIC_API_URL=\$\{\{\s*vars\.NEXT_PUBLIC_API_URL\s*\}\}/g,
    ) ?? [];

  assert.equal(
    buildArgMatches.length,
    2,
    "Web and Admin image builds must both receive the public API URL",
  );
});

test("published images block deployment only for critical Trivy vulnerabilities", async () => {
  const [publishWorkflow, trivyIgnore] = await Promise.all([
    readFile(
      path.join(repoRoot, ".github", "workflows", "publish-images.yml"),
      "utf8",
    ),
    readFile(path.join(repoRoot, ".trivyignore.yaml"), "utf8"),
  ]);

  assert.equal(
    (publishWorkflow.match(/uses: aquasecurity\/trivy-action@v0\.36\.0/g) ?? [])
      .length,
    5,
    "API, PDF renderer, Migrator, Web, and Admin images must each be scanned",
  );
  assert.equal(
    (publishWorkflow.match(/severity: CRITICAL$/gm) ?? []).length,
    5,
  );
  assert.doesNotMatch(
    publishWorkflow,
    /severity: CRITICAL,HIGH/,
    "high vulnerabilities must not block image publication",
  );
  assert.equal((publishWorkflow.match(/exit-code: "1"/g) ?? []).length, 5);
  assert.equal(
    (publishWorkflow.match(/trivyignores: \.trivyignore\.yaml/g) ?? []).length,
    1,
    "only the API scan should load the shared Trivy ignore file",
  );
  assert.match(trivyIgnore, /id:\s*CVE-2026-67213/);
  assert.match(trivyIgnore, /pkg:npm\/nanoid@3\.3\.16/);
  assert.match(trivyIgnore, /vulnerable customAlphabet API is not used/);
  assert.doesNotMatch(
    trivyIgnore,
    /CVE-2026-14257/,
    "patched brace-expansion versions must not be suppressed",
  );

  const finalScanIndex = publishWorkflow.indexOf("- name: Scan Admin image");
  const deploymentIndex = publishWorkflow.indexOf(
    "- name: Trigger production deployment",
  );

  assert.ok(finalScanIndex >= 0);
  assert.ok(
    deploymentIndex > finalScanIndex,
    "deployment must only be triggered after every image scan passes",
  );
});

test("CI validates pull requests and only reruns on pushes to main", async () => {
  const ciWorkflow = await readFile(
    path.join(repoRoot, ".github", "workflows", "ci.yml"),
    "utf8",
  );
  const triggerBlock = ciWorkflow.slice(0, ciWorkflow.indexOf("permissions:"));

  assert.match(triggerBlock, /pull_request:\s+branches:\s+- main\s+- develop/);
  assert.match(triggerBlock, /push:\s+branches:\s+- main/);
  assert.doesNotMatch(triggerBlock, /push:[\s\S]*- develop/);
  assert.doesNotMatch(triggerBlock, /release\/\*\*/);
});

test("API runtime excludes migration and unused build tooling", async () => {
  const rootPackage = JSON.parse(
    await readFile(path.join(repoRoot, "package.json"), "utf8"),
  );
  const apiPackage = JSON.parse(
    await readFile(path.join(repoRoot, "apps", "api", "package.json"), "utf8"),
  );
  const apiDockerfile = await readFile(
    path.join(repoRoot, "apps", "api", "Dockerfile"),
    "utf8",
  );
  const htmlPdfRendererService = await readFile(
    path.join(
      repoRoot,
      "apps",
      "api",
      "src",
      "modules",
      "warranty-certificates",
      "services",
      "html-pdf-renderer.service.ts",
    ),
    "utf8",
  );

  for (const dependency of [
    "prisma",
    "@prisma/config",
    "@tailwindcss/cli",
    "tailwindcss",
  ]) {
    assert.equal(
      apiPackage.dependencies?.[dependency],
      undefined,
      `${dependency} must not ship as an API runtime dependency`,
    );
  }

  assert.ok(
    apiPackage.dependencies?.["puppeteer-core"],
    "the local PDF fallback must declare puppeteer-core explicitly",
  );
  assert.match(
    htmlPdfRendererService,
    /await import\(['"]puppeteer-core['"]\)/,
    "the API must load puppeteer-core only when the local PDF fallback runs",
  );
  assert.doesNotMatch(
    htmlPdfRendererService,
    /^import (?!type\b).* from ['"]puppeteer-core['"];?$/m,
    "puppeteer-core must not be loaded eagerly by the API",
  );

  for (const buildDependency of ["prisma", "@tailwindcss/cli", "tailwindcss"]) {
    assert.ok(
      apiPackage.devDependencies?.[buildDependency],
      `${buildDependency} must remain available to API builds`,
    );
  }

  assert.match(
    apiDockerfile,
    /--config\.auto-install-peers=false --filter @repo\/api deploy --prod --no-optional --ignore-scripts \/prod\/api/,
  );
  assert.match(
    apiDockerfile,
    /cd \/prod\/api && \/app\/apps\/api\/node_modules\/\.bin\/prisma generate/,
  );
  assert.match(
    apiDockerfile,
    /rm -rf \/usr\/local\/lib\/node_modules\/npm \/usr\/local\/lib\/node_modules\/corepack/,
  );

  assert.match(apiPackage.dependencies.axios, /^\^1\.(?:1[89]|[2-9]\d)\./);
  assert.match(apiPackage.dependencies.multer, /^\^2\.[2-9]\./);
  assert.match(apiPackage.dependencies.nodemailer, /^\^9\./);

  for (const [dependency, safeVersion] of Object.entries({
    "brace-expansion@1": "1.1.18",
    "brace-expansion@2": "2.1.4",
    "brace-expansion@5": "5.0.9",
    "cross-spawn@7": "7.0.6",
    "fast-uri@3": "3.1.6",
    "form-data": "4.0.6",
    "glob@10": "10.5.0",
    hono: "4.12.25",
    "js-yaml": "5.2.2",
    "minimatch@3": "3.1.4",
    "minimatch@9": "9.0.7",
    multer: "2.2.0",
    picomatch: "4.0.4",
    postcss: "8.5.18",
    svgo: "4.0.2",
    "undici@6": "6.27.0",
  })) {
    assert.equal(rootPackage.pnpm?.overrides?.[dependency], safeVersion);
  }
});

test("production runners refresh Alpine security packages before image scans", async () => {
  const apps = ["api", "api-migrator", "api-pdf-renderer", "web", "admin"];
  const publishWorkflow = await readFile(
    path.join(repoRoot, ".github", "workflows", "publish-images.yml"),
    "utf8",
  );

  for (const app of apps) {
    const dockerfile = await readFile(
      path.join(repoRoot, "apps", app, "Dockerfile"),
      "utf8",
    );
    const runnerStage = dockerfile.match(
      /FROM [^\n]+ AS runner[\s\S]*?(?=\nFROM |$)/,
    )?.[0];

    assert.ok(runnerStage, `${app} production runner stage must exist`);
    assert.match(
      runnerStage,
      /RUN apk upgrade --no-cache/,
      `${app} runner must install Alpine security updates in the final image`,
    );
  }

  const imageBuildSteps = [
    "Build and push API image",
    "Build and push API migrator image",
    "Build and push PDF renderer image",
    "Build and push Web image",
    "Build and push Admin image",
  ];

  for (const stepName of imageBuildSteps) {
    const stepStart = publishWorkflow.indexOf(`- name: ${stepName}`);
    const nextStepStart = publishWorkflow.indexOf(
      "\n      - name:",
      stepStart + 1,
    );
    const step = publishWorkflow.slice(
      stepStart,
      nextStepStart >= 0 ? nextStepStart : undefined,
    );

    assert.ok(stepStart >= 0, `${stepName} must exist`);
    assert.match(step, /\n\s+pull: true\s*$/m);
    assert.match(step, /\n\s+no-cache-filters: runner\s*$/m);
  }
});

test("API lint scripts avoid brace globs that are unstable across minimatch versions", async () => {
  const apiPackage = JSON.parse(
    await readFile(path.join(repoRoot, "apps", "api", "package.json"), "utf8"),
  );

  for (const scriptName of ["lint", "lint:fix", "lint:strict"]) {
    const lintScript = apiPackage.scripts[scriptName];

    assert.doesNotMatch(
      lintScript,
      /\{src,apps,libs,test\}/,
      `${scriptName} must use explicit source globs`,
    );
    assert.match(lintScript, /src\/\*\*\/\*\.ts/);
    assert.match(lintScript, /test\/\*\*\/\*\.ts/);
  }
});

test("database migrations use a dedicated disposable image", async () => {
  const [
    migratorDockerfile,
    migratorPackage,
    compose,
    deployWorkflow,
    publishWorkflow,
  ] = await Promise.all([
    readFile(path.join(repoRoot, "apps", "api-migrator", "Dockerfile"), "utf8"),
    readFile(
      path.join(repoRoot, "apps", "api-migrator", "package.json"),
      "utf8",
    ),
    readFile(path.join(repoRoot, "docker-compose.prod.yml"), "utf8"),
    readFile(path.join(repoRoot, ".github", "workflows", "deploy.yml"), "utf8"),
    readFile(
      path.join(repoRoot, ".github", "workflows", "publish-images.yml"),
      "utf8",
    ),
  ]);

  assert.match(
    migratorDockerfile,
    /CMD \[[^\n]*prisma[^\n]*"migrate"[^\n]*"deploy"/,
  );
  assert.match(
    migratorDockerfile,
    /pnpm install --frozen-lockfile --prod --filter @repo\/api-migrator --ignore-scripts/,
  );
  assert.match(
    migratorDockerfile,
    /pnpm --filter @repo\/api-migrator rebuild @prisma\/engines prisma/,
  );
  assert.match(migratorDockerfile, /FROM node:22-alpine AS builder/);
  assert.match(migratorDockerfile, /FROM node:22-alpine AS runner/);
  assert.match(
    migratorDockerfile,
    /COPY --from=builder .*\/app\/node_modules .*\/node_modules/,
  );
  assert.match(
    migratorDockerfile,
    /rm -rf \/usr\/local\/lib\/node_modules\/npm \/usr\/local\/lib\/node_modules\/corepack/,
  );
  assert.match(JSON.parse(migratorPackage).dependencies.prisma, /^\^7\.9\./);
  assert.match(compose, /^\s{2}migrate:\s*$/m);
  assert.match(compose, /image: \$\{MIGRATOR_IMAGE[^}]*\}:\$\{IMAGE_TAG/);
  assert.doesNotMatch(
    compose,
    /DATABASE_URL:\s*\$\{DATABASE_URL:-/,
    "host DATABASE_URL must not leak into production containers",
  );
  assert.equal(
    (
      compose.match(
        /DATABASE_URL:\s*\$\{DOCKER_DATABASE_URL:-postgresql:\/\/[^\n]*@db:5432\/[^\n]*\}/g,
      ) ?? []
    ).length,
    4,
    "migrate, API, email worker, and activation-label worker must use the Docker-internal database address",
  );
  assert.match(
    deployWorkflow,
    /actions\/checkout@v4[\s\S]*appleboy\/scp-action@v1[\s\S]*source: docker-compose\.prod\.yml[\s\S]*target: \$\{\{ secrets\.DEPLOY_PATH \}\}[\s\S]*Deploy over SSH/,
    "deployment must synchronize the production Compose file before SSH commands run",
  );
  assert.match(
    deployWorkflow,
    /docker compose .* --profile tools config --services \| grep -qx migrate/,
  );
  assert.match(
    deployWorkflow,
    /docker compose .* --profile tools pull migrate pdf-renderer api worker-email web admin/,
  );
  assert.match(
    deployWorkflow,
    /docker compose .* --profile tools run --rm migrate/,
  );
  assert.doesNotMatch(deployWorkflow, /run --rm api npx prisma migrate deploy/);
  assert.match(
    publishWorkflow,
    /file: apps\/api-migrator\/Dockerfile[\s\S]*migrator_image/,
  );
});

test("production deployment safely cleans only stale project images", async () => {
  const deployWorkflow = await readFile(
    path.join(repoRoot, ".github", "workflows", "deploy.yml"),
    "utf8",
  );

  assert.match(
    deployWorkflow,
    /cleanup-images:[\s\S]*needs:\s*\n\s*- deploy\s*\n\s*- health-check/,
    "image cleanup must wait for deployment health checks",
  );
  assert.match(
    deployWorkflow,
    /previous_tag=.*\.deploy\/previous-image-tag/,
    "cleanup must preserve the previously deployed image tag for rollback",
  );
  assert.match(
    deployWorkflow,
    /for repository in "\$API_IMAGE" "\$PDF_RENDERER_IMAGE" "\$WEB_IMAGE" "\$ADMIN_IMAGE"/,
    "cleanup must be scoped to this project's application repositories",
  );
  assert.match(
    deployWorkflow,
    /\[ "\$image" = "\$repository:\$IMAGE_TAG" \] && continue/,
    "cleanup must preserve the currently deployed image tag",
  );
  assert.match(
    deployWorkflow,
    /\[ "\$image" = "\$repository:\$previous_tag" \] && continue/,
    "cleanup must preserve the previous image tag",
  );
  assert.doesNotMatch(
    deployWorkflow,
    /docker (?:system|volume) prune|docker image prune\s+-a/,
    "deployment must not run host-wide or volume cleanup on a shared VPS",
  );
});

test("container runtime stages match the production ports documented for deployment", async () => {
  const ports = { api: 4100, web: 4101, admin: 4102 };

  for (const [app, port] of Object.entries(ports)) {
    const dockerfile = await readFile(
      path.join(repoRoot, "apps", app, "Dockerfile"),
      "utf8",
    );
    const runtimeStage =
      app === "api"
        ? dockerfile.match(
            /FROM (?:base|node:22-alpine) AS runner[\s\S]*?(?=\nFROM |$)/,
          )?.[0]
        : dockerfile;

    assert.ok(runtimeStage, `${app} production runtime stage must exist`);
    assert.match(runtimeStage, new RegExp(`ENV PORT=${port}`));
    assert.doesNotMatch(runtimeStage, /EXPOSE 300[012]/);
    assert.match(runtimeStage, new RegExp(`EXPOSE ${port}`));
  }

  const pdfRendererDockerfile = await readFile(
    path.join(repoRoot, "apps", "api-pdf-renderer", "Dockerfile"),
    "utf8",
  );
  const pdfRendererStage = pdfRendererDockerfile.match(
    /FROM [^\n]+ AS runner[\s\S]*?(?=\nFROM |$)/,
  )?.[0];

  assert.ok(pdfRendererStage, "PDF renderer production stage must exist");
  assert.match(pdfRendererStage, /ENV PORT=3001/);
  assert.match(pdfRendererStage, /EXPOSE 3001/);

  const apiDockerfile = await readFile(
    path.join(repoRoot, "apps", "api", "Dockerfile"),
    "utf8",
  );
  assert.doesNotMatch(apiDockerfile, /@repo\/api-pdf-renderer|pdf-runner/);
});

test("PDF renderer remains independently buildable and quality-gated", async () => {
  const [
    packageJson,
    dockerfile,
    developmentCompose,
    ciWorkflow,
    publishWorkflow,
  ] = await Promise.all([
    readFile(
      path.join(repoRoot, "apps", "api-pdf-renderer", "package.json"),
      "utf8",
    ),
    readFile(
      path.join(repoRoot, "apps", "api-pdf-renderer", "Dockerfile"),
      "utf8",
    ),
    readFile(path.join(repoRoot, "docker-compose.dev.yml"), "utf8"),
    readFile(path.join(repoRoot, ".github", "workflows", "ci.yml"), "utf8"),
    readFile(
      path.join(repoRoot, ".github", "workflows", "publish-images.yml"),
      "utf8",
    ),
  ]);
  const scripts = JSON.parse(packageJson).scripts;

  for (const script of ["build", "check-types", "lint", "test"]) {
    assert.equal(typeof scripts[script], "string", `${script} gate must exist`);
  }

  assert.match(
    developmentCompose,
    /dockerfile: apps\/api-pdf-renderer\/Dockerfile[\s\S]*127\.0\.0\.1:\$\{PDF_RENDERER_PORT:-3001\}:3001/,
  );
  assert.match(
    ciWorkflow,
    /pdf-renderer:[\s\S]*pnpm lint:pdf-renderer[\s\S]*pnpm typecheck:pdf-renderer[\s\S]*pnpm test:pdf-renderer[\s\S]*pnpm build:pdf-renderer/,
  );
  assert.match(
    publishWorkflow,
    /Build and push PDF renderer image[\s\S]*file: apps\/api-pdf-renderer\/Dockerfile/,
  );
  assert.match(dockerfile, /FROM node:\d+\.\d+\.\d+-alpine\d+\.\d+ AS runner/);
  assert.match(dockerfile, /ENV HOME=\/tmp/);
  assert.match(dockerfile, /USER pdf/);
  assert.match(dockerfile, /HEALTHCHECK[\s\S]*127\.0\.0\.1:3001\/health/);
  assert.match(
    ciWorkflow,
    /pdf-renderer-chromium:[\s\S]*timeout-minutes: 15[\s\S]*--cpus 2[\s\S]*--memory 2g[\s\S]*--pids-limit 256/,
  );
  assert.match(
    ciWorkflow,
    /RUN_PDF_RENDERER_INTEGRATION: "true"[\s\S]*actions\/upload-artifact@v4/,
  );
});

test("production infrastructure ports are only published on localhost", async () => {
  const compose = await readFile(
    path.join(repoRoot, "docker-compose.prod.yml"),
    "utf8",
  );

  const publishedPorts = [
    ["PROD_DB_PORT", 25432, 5432],
    ["REDIS_DB_PORT", 16379, 6379],
    ["MINIO_PORT", 19000, 9000],
    ["MINIO_CONSOLE_PORT", 19001, 9001],
    ["API_PORT", 4100, 4100],
    ["WEB_PORT", 4101, 4101],
    ["ADMIN_PORT", 4102, 4102],
  ];

  for (const [variable, fallback, containerPort] of publishedPorts) {
    assert.match(
      compose,
      new RegExp(
        `127\\.0\\.0\\.1:\\$\\{${variable}:-${fallback}\\}:${containerPort}`,
      ),
      `${variable} must not be exposed on every VPS network interface`,
    );
  }
});

test("production MinIO initialization verifies public bucket downloads", async () => {
  const [compose, deployWorkflow] = await Promise.all([
    readFile(path.join(repoRoot, "docker-compose.prod.yml"), "utf8"),
    readFile(path.join(repoRoot, ".github", "workflows", "deploy.yml"), "utf8"),
  ]);

  assert.match(
    compose,
    /mc anonymous set download "minio\/\$\$\{MINIO_BUCKET_PUBLIC\}"/,
  );
  assert.match(
    compose,
    /mc anonymous get "minio\/\$\$\{MINIO_BUCKET_PUBLIC\}"/,
    "MinIO initialization must fail when the public download policy was not applied",
  );
  assert.match(
    deployWorkflow,
    /docker compose .* run --rm minio-init/,
    "deployment must reapply the idempotent MinIO bucket policies",
  );
});
