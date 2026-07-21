import { CategoryExcelRow } from '@/modules/categories/excel/category-excel.types';
import { Category, Prisma } from '@prisma/client';

type CategoryWithParent = Category & { parent: Pick<Category, 'slug'> | null };

export function toCategoryExcelRow(
  category: CategoryWithParent,
): CategoryExcelRow {
  return {
    type: category.type,
    code: category.code,
    slug: category.slug,
    name: category.name,
    description: category.description,
    parentSlug: category.parent?.slug ?? null,
    icon: category.icon,
    imageUrl: category.image_url,
    order: category.order,
    isActive: category.is_active,
    metadata: category.metadata as Prisma.JsonObject | null,
  };
}
