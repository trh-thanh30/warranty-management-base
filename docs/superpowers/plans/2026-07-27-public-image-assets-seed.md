# Public Image Asset Seed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use the three prepared mobile homepage images and idempotently register actively used static public images in the `Asset` table.

**Architecture:** Homepage hero constants explicitly pair desktop and mobile sources. A dedicated Prisma seed module owns a deterministic static-image manifest, resolves files relative to the repository, derives metadata, and updates or creates one `Asset` per public path.

**Tech Stack:** TypeScript, Next.js, Jest, Prisma 7, Node.js filesystem APIs.

## Global Constraints

- Create `Asset` records only; do not create `ProductAsset` or `ProductTemplateAsset` records.
- Do not scan application source files at seed runtime.
- Do not seed files under `apps/api/storage/public`.
- Do not seed known unused public images.
- Repeated seed runs must not create duplicate active records for the same path.
- Preserve all existing user-owned image files and worktree changes.

---

### Task 1: Configure Homepage Mobile Hero Images

**Files:**

- Modify: `apps/web/src/views/home/home.constants.ts`
- Test: `apps/web/src/views/home/home.constants.test.ts`

**Interfaces:**

- Consumes: Existing `HeroImageItem` with optional `srcMobile`.
- Produces: `carHeroImages` entries pairing `/bg_N.jpg` with `/mobile_N.jpg`.

- [ ] **Step 1: Write the failing constants test**

Create a Jest test that expects:

```ts
expect(carHeroImages.map(({ src, srcMobile }) => ({ src, srcMobile }))).toEqual(
  [
    { src: "/bg_1.jpg", srcMobile: "/mobile_1.jpg" },
    { src: "/bg_2.jpg", srcMobile: "/mobile_2.jpg" },
    { src: "/bg_3.jpg", srcMobile: "/mobile_3.jpg" },
  ],
);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm --filter @repo/web test -- --runInBand src/views/home/home.constants.test.ts
```

Expected: FAIL because all three `srcMobile` values are `undefined`.

- [ ] **Step 3: Add the mobile mappings**

Update `carHeroImages` to:

```ts
export const carHeroImages: HeroImageItem[] = [
  { id: "primary", src: "/bg_1.jpg", srcMobile: "/mobile_1.jpg" },
  { id: "technology", src: "/bg_2.jpg", srcMobile: "/mobile_2.jpg" },
  { id: "protection", src: "/bg_3.jpg", srcMobile: "/mobile_3.jpg" },
];
```

- [ ] **Step 4: Run test and web type checking**

Run:

```bash
pnpm --filter @repo/web test -- --runInBand src/views/home/home.constants.test.ts
pnpm --filter @repo/web check-types
```

Expected: test PASS and type checking exits with code 0.

### Task 2: Add the Static Public Asset Seed

**Files:**

- Create: `apps/api/prisma/seed-assets.ts`
- Create: `apps/api/src/modules/assets/tests/seed-assets.spec.ts`
- Modify: `apps/api/prisma/seed.ts`

**Interfaces:**

- Consumes: `PrismaClient`, the web/admin public roots, and an explicit manifest of public URL paths.
- Produces: `seedPublicImageAssets(prisma: PrismaClient): Promise<void>`.

- [ ] **Step 1: Write failing metadata and idempotency tests**

Cover these behaviors:

```ts
it("derives image metadata from a manifest entry", async () => {
  const result = await inspectPublicImage("/mobile_1.jpg");
  expect(result).toMatchObject({
    filename: "mobile_1.jpg",
    mimeType: "image/jpeg",
    path: "/mobile_1.jpg",
  });
  expect(result.size).toBeGreaterThan(0);
});

it("updates an existing active asset instead of creating another", async () => {
  prisma.asset.findMany.mockResolvedValue([{ id: "asset-1" }]);
  await seedPublicImageAssets(prisma);
  expect(prisma.asset.update).toHaveBeenCalled();
  expect(prisma.asset.create).not.toHaveBeenCalled();
});

it("rejects duplicate active assets for one public path", async () => {
  prisma.asset.findMany.mockResolvedValue([
    { id: "asset-1" },
    { id: "asset-2" },
  ]);
  await expect(seedPublicImageAssets(prisma)).rejects.toThrow(
    "Multiple active assets found",
  );
});
```

Use a mocked Prisma asset delegate and real fixture files from the public
folders. Also assert that the manifest contains `/mobile_1.jpg`,
`/mobile_2.jpg`, and `/mobile_3.jpg`, and excludes the known unused paths.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm --filter @repo/api test -- --runInBand src/modules/assets/tests/seed-assets.spec.ts
```

Expected: FAIL because `prisma/seed-assets.ts` does not exist.

- [ ] **Step 3: Implement the explicit manifest and file inspection**

In `seed-assets.ts`:

```ts
export const PUBLIC_IMAGE_PATHS = [
  "/bg_1.jpg",
  "/bg_2.jpg",
  "/bg_3.jpg",
  "/feat1.jpg",
  "/feat2.jpg",
  "/feat3.jpg",
  "/logo_2.png",
  "/mobile_1.jpg",
  "/mobile_2.jpg",
  "/mobile_3.jpg",
  "/hero/hero.jpg",
  "/hero/hero_2.jpg",
  "/hero/hero_3.jpg",
  "/hero/hero_5.jpg",
  "/hero/hero_6.jpg",
  "/hero/hero_7.jpg",
  "/brands/audi.svg",
  "/brands/bmw.png",
  "/brands/ford.svg",
  "/brands/genesis.png",
  "/brands/honda.svg",
  "/brands/hyundai.svg",
  "/brands/jaguar.svg",
  "/brands/kia.svg",
  "/brands/landrover.jpeg",
  "/brands/lexus.svg",
  "/brands/mercedes.svg",
  "/brands/porsche.svg",
  "/brands/tesla.svg",
  "/brands/toyota.svg",
  "/brands/volkswagen.svg",
  "/brands/volvo.svg",
  "/guest/guest_1.jpg",
  "/guest/guest_2.jpg",
  "/guest/guest_3.jpg",
  "/guest/guest_4.jpg",
  "/guest/guest_5.jpg",
  "/guest/guest_6.jpg",
  "/guest/guest_7.jpg",
  "/guest/guest_8.jpg",
  "/guest/guest_9.jpg",
  "/product/product_1.jpg",
  "/product/product_2.jpg",
  "/product/product_3.jpg",
  "/product/product_4.jpg",
  "/product/product_5.jpg",
  "/product/product_6.jpg",
  "/product/product_7.jpg",
  "/product/product_8.jpg",
  "/product/product_9.jpg",
  "/product/product_10.jpg",
  "/product/product_11.jpg",
  "/product/product_12.jpg",
  "/product/product_13.jpg",
  "/product/product_14.jpg",
] as const;

export const ADMIN_PUBLIC_IMAGE_PATHS = ["/logo.png"] as const;

export async function inspectPublicImage(publicPath: string) {
  // Resolve only beneath apps/web/public or apps/admin/public.
  // Read stat metadata and map jpg/jpeg/png/svg to MIME types.
  // Return originalName, filename, mimeType, size, path, and folder.
}
```

Populate the array with every unique image path referenced by code after Task

1. Exclude `red_car_hero.png`, `hero/hero_4.jpg`, `hero_5_hd.png`,
   `hero/hero_8.png`, `hero_5_red_left.png`, `logo_1.jpg`, and `hi.jpg`.

- [ ] **Step 4: Implement idempotent database writes**

For each inspected image:

```ts
const matches = await prisma.asset.findMany({
  where: { path: image.path, is_deleted: false },
  select: { id: true },
  take: 2,
});

if (matches.length > 1) {
  throw new Error(`Multiple active assets found for path ${image.path}`);
}

const data = {
  original_name: image.originalName,
  filename: image.filename,
  mime_type: image.mimeType,
  size: image.size,
  path: image.path,
  access_type: asset_access_type.PUBLIC,
  type: asset_type.IMAGE,
  folder: image.folder,
  metadata: { source: "public-static-seed" },
};
```

Update `matches[0]` when present; otherwise create a record. Export
`seedPublicImageAssets`.

- [ ] **Step 5: Integrate the module into the main development seed**

Import and call:

```ts
import { seedPublicImageAssets } from "./seed-assets";

await seedPublicImageAssets(prisma);
```

Place the call after Prisma initialization and before seed completion is
reported.

- [ ] **Step 6: Run focused and regression verification**

Run:

```bash
pnpm --filter @repo/api test -- --runInBand src/modules/assets/tests/seed-assets.spec.ts
pnpm --filter @repo/api check-types
pnpm --filter @repo/web test -- --runInBand src/views/home/home.constants.test.ts
pnpm --filter @repo/web check-types
```

Expected: all tests PASS and both type-check commands exit with code 0.

### Task 3: Verify Manifest Accuracy

**Files:**

- Verify: `apps/api/prisma/seed-assets.ts`
- Verify: `apps/web/public`
- Verify: `apps/admin/public`

**Interfaces:**

- Consumes: Final `PUBLIC_IMAGE_PATHS`.
- Produces: Evidence that every manifest entry exists and all active static image references are represented.

- [ ] **Step 1: Check every manifest file exists**

Run the focused seed test that iterates `PUBLIC_IMAGE_PATHS` through
`inspectPublicImage`.

Expected: PASS with no missing file or unsupported extension error.

- [ ] **Step 2: Search for mobile references**

Run:

```bash
rg -n "mobile_[123]\\.jpg" apps/web/src apps/api/prisma
```

Expected: homepage constants and the seed manifest reference all three files.

- [ ] **Step 3: Check formatting and final diff**

Run:

```bash
pnpm exec prettier --check apps/web/src/views/home/home.constants.ts apps/web/src/views/home/home.constants.test.ts apps/api/prisma/seed-assets.ts apps/api/src/modules/assets/tests/seed-assets.spec.ts apps/api/prisma/seed.ts
git diff --check
```

Expected: Prettier succeeds and `git diff --check` reports no whitespace errors.
