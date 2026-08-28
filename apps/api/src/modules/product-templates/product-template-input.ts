import { NotFoundError } from '@/common/response';
import { ProductTemplatesRepository } from '@/modules/product-templates/repository/product-templates.repository';
import { Prisma } from '@prisma/client';

export function normalizeSku(value: string) {
  return value.trim().toUpperCase();
}

export async function resolveProductTemplateCategory(
  repository: ProductTemplatesRepository,
  categoryId: string,
) {
  const category = await repository.findProductCategoryById(categoryId);
  if (!category) {
    throw new NotFoundError('Product category not found');
  }
  return category;
}

export async function validateProductTemplateAssets(
  repository: ProductTemplatesRepository,
  coverAssetId?: string | null,
  galleryAssetIds?: string[],
) {
  const ids = Array.from(
    new Set(
      [coverAssetId, ...(galleryAssetIds ?? [])].filter((id): id is string =>
        Boolean(id),
      ),
    ),
  );
  if (ids.length === 0) return;

  const assets = await repository.findImageAssets(ids);
  if (assets.length !== ids.length) {
    throw new NotFoundError('Product template image asset not found');
  }
}

export function toTemplateJson(
  value: object | null | undefined,
): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (value === undefined) return undefined;
  return value === null ? Prisma.JsonNull : value;
}

export function mergeProductTemplateMetadata(
  existing: unknown,
  update: object | null | undefined,
) {
  if (update === undefined) return undefined;
  if (update === null) return null;
  return {
    ...(isRecord(existing) ? existing : {}),
    ...update,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
