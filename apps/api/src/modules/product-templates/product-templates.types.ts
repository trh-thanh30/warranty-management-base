import {
  Asset,
  Category,
  ProductTemplate,
  ProductTemplateAsset,
} from '@prisma/client';

export type ProductTemplateWithRelations = ProductTemplate & {
  assets?: Array<ProductTemplateAsset & { asset: Asset }>;
  category_ref?: Category | null;
  _count?: { products: number };
};

export function toProductTemplateResponse(
  template: ProductTemplateWithRelations,
  resolveAssetUrl: (asset: Asset) => string = (asset) => asset.path,
) {
  return {
    id: template.id,
    sku: template.sku,
    slug: template.slug,
    name: template.name,
    categoryId: template.category_id,
    categoryRef: template.category_ref
      ? {
          id: template.category_ref.id,
          type: template.category_ref.type,
          code: template.category_ref.code,
          slug: template.category_ref.slug,
          name: template.category_ref.name,
          description: template.category_ref.description,
          parentId: template.category_ref.parent_id,
          icon: template.category_ref.icon,
          imageUrl: template.category_ref.image_url,
          order: template.category_ref.order,
          isActive: template.category_ref.is_active,
          metadata: template.category_ref.metadata as Record<
            string,
            unknown
          > | null,
          createdAt: template.category_ref.created_at,
          updatedAt: template.category_ref.updated_at,
        }
      : null,
    brand: template.brand,
    model: template.model,
    modelYear: template.model_year,
    description: template.description,
    defaultWarrantyDurationMonths: template.default_warranty_duration_months,
    defaultWarrantyTerms: template.default_warranty_terms,
    metadata: template.metadata as Record<string, unknown> | null,
    isActive: template.is_active,
    isPublished: template.is_published,
    publishedAt: template.published_at,
    productCount: template._count?.products ?? 0,
    assets:
      template.assets?.map((templateAsset) => ({
        id: templateAsset.id,
        assetId: templateAsset.asset_id,
        role: templateAsset.role,
        sortOrder: templateAsset.sort_order,
        altText: templateAsset.alt_text,
        url: resolveAssetUrl(templateAsset.asset),
        mimeType: templateAsset.asset.mime_type,
        originalName: templateAsset.asset.original_name,
        source: 'TEMPLATE' as const,
      })) ?? [],
    createdAt: template.created_at,
    updatedAt: template.updated_at,
  };
}
