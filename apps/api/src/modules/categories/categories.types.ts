import { Category } from '@prisma/client';

export function toCategoryResponse(category: Category) {
  return {
    id: category.id,
    type: category.type,
    code: category.code,
    slug: category.slug,
    name: category.name,
    description: category.description,
    parentId: category.parent_id,
    icon: category.icon,
    imageUrl: category.image_url,
    order: category.order,
    isActive: category.is_active,
    metadata: category.metadata as Record<string, unknown> | null,
    createdAt: category.created_at,
    updatedAt: category.updated_at,
  };
}
