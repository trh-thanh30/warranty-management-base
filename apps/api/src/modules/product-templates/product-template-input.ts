import { NotFoundError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ProductTemplatesRepository } from '@/modules/product-templates/repository/product-templates.repository';
import { category_type, Prisma } from '@prisma/client';

export function normalizeSku(value: string) {
  return value.trim().toUpperCase();
}

export async function resolveProductTemplateCategory(
  prismaService: PrismaService,
  categoryId: string,
) {
  const category = await prismaService.category.findUnique({
    where: { id: categoryId },
  });
  if (!category || category.type !== category_type.PRODUCT) {
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
  value: Record<string, unknown> | null | undefined,
): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (value === undefined) return undefined;
  return value === null ? Prisma.JsonNull : (value as Prisma.InputJsonObject);
}
