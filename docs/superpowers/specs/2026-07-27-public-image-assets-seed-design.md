# Public Image Asset Seed Design

## Goal

Register public images that are actively referenced by application code in the
`Asset` table, and use the three prepared mobile images for the homepage hero.

## Scope

- Map `/mobile_1.jpg`, `/mobile_2.jpg`, and `/mobile_3.jpg` to the three
  homepage hero slides in the same order as `/bg_1.jpg`, `/bg_2.jpg`, and
  `/bg_3.jpg`.
- Add a dedicated asset seed module under `apps/api/prisma`.
- Seed only image paths explicitly listed as active application assets.
- Create or update `Asset` records only. Do not create `ProductAsset` or
  `ProductTemplateAsset` relations.
- Leave uploaded files under `apps/api/storage/public` unchanged.

## Asset Manifest

The seed module owns an explicit manifest of active public image paths. The
manifest is deterministic and reviewable; it does not scan source files at seed
runtime. It includes the mobile hero images after they are referenced by the
homepage and excludes known unused images.

Each manifest entry resolves to a file beneath `apps/web/public` or
`apps/admin/public`. The seed derives:

- `original_name` and `filename` from the file name.
- `mime_type` from the supported file extension.
- `size` from filesystem metadata.
- `path` from the public URL.
- `access_type` as `PUBLIC`.
- `type` as `IMAGE`.
- `folder` from the public path when present.
- `metadata` identifying the record as a public static seed asset.

## Idempotency

The current schema does not make `Asset.path` unique. For each manifest entry,
the seed finds a non-deleted record by exact `path`. It updates that record when
found and creates it otherwise. This prevents normal repeated seed runs from
creating duplicates without changing the database schema.

If duplicate active records already exist for one path, the seed fails with a
clear error instead of silently choosing one.

## Path Resolution

Paths are resolved relative to the seed module location, not the shell working
directory. This keeps development and test seed commands consistent when
invoked from the repository root or the API package.

Missing files, unsupported extensions, or paths escaping the configured public
roots fail the seed with an actionable message.

## Integration

`seed.ts` calls the asset seed after the Prisma client is initialized. The
dedicated module accepts a Prisma client so its filesystem discovery and record
upsert behavior can be tested independently.

## Verification

- Unit tests cover manifest resolution, metadata derivation, missing files,
  duplicate database rows, and repeated seed behavior.
- API type checking verifies Prisma inputs.
- Web tests or type checking verify the homepage hero constants.
- A static search confirms the three mobile images are referenced.
