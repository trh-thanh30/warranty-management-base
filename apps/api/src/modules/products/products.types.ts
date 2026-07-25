import {
  Asset,
  Category,
  Customer,
  Product,
  ProductAsset,
  ProductOwnership,
  Warranty,
} from '@prisma/client';
import {
  ProductTemplateWithRelations,
  toProductTemplateResponse,
} from '@/modules/product-templates/product-templates.types';

type ProductWithRelations = Product & {
  assets?: Array<ProductAsset & { asset: Asset }>;
  category_ref?: Category | null;
  ownerships?: Array<ProductOwnership & { customer?: Customer }>;
  warranty?: Warranty | null;
  template?: ProductTemplateWithRelations | null;
};

function toCategorySummary(category: Category | null | undefined) {
  if (!category) {
    return null;
  }

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

export function toProductResponse(
  product: ProductWithRelations,
  resolveAssetUrl: (asset: Asset) => string = (asset) => asset.path,
) {
  const currentOwnership = product.ownerships?.find(
    (ownership) => ownership.is_current_owner,
  );
  const templateResponse = product.template
    ? toProductTemplateResponse(product.template, resolveAssetUrl)
    : null;
  const effectiveMetadata = templateResponse
    ? mergeEffectiveMetadata(templateResponse.metadata, product.metadata)
    : (product.metadata as Record<string, unknown> | null);
  const productAssets =
    product.assets?.map((productAsset) => ({
      id: productAsset.id,
      assetId: productAsset.asset_id,
      role: productAsset.role,
      sortOrder: productAsset.sort_order,
      altText: productAsset.alt_text,
      url: resolveAssetUrl(productAsset.asset),
      mimeType: productAsset.asset.mime_type,
      originalName: productAsset.asset.original_name,
      source: 'PRODUCT' as const,
    })) ?? [];

  return {
    id: product.id,
    templateId: product.template_id,
    template: templateResponse,
    productCode: product.product_code,
    slug: product.slug,
    warrantyCode: product.warranty_code,
    serialNumber: product.serial_number,
    name: templateResponse?.name ?? product.name,
    category: templateResponse?.category ?? product.category,
    categoryId: templateResponse?.categoryId ?? product.category_id,
    categoryRef:
      templateResponse?.categoryRef ?? toCategorySummary(product.category_ref),
    brand: templateResponse?.brand ?? product.brand,
    model: templateResponse?.model ?? product.model,
    manufactureYear:
      templateResponse?.manufactureYear ?? product.manufacture_year,
    description: templateResponse?.description ?? product.description,
    status: product.status,
    metadata: effectiveMetadata,
    isPublished: product.is_published,
    publishedAt: product.published_at,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    deletedAt: product.deleted_at,
    owner: currentOwnership
      ? {
          customerId: currentOwnership.customer_id,
          ownerUserId: currentOwnership.owner_user_id,
          customerCode: currentOwnership.customer?.customer_code,
          fullName: currentOwnership.customer?.full_name,
          purchaseDate: currentOwnership.purchase_date,
          activatedAt: currentOwnership.activated_at,
        }
      : null,
    warranty: product.warranty
      ? {
          id: product.warranty.id,
          warrantyCode: product.warranty.warranty_code,
          startDate: product.warranty.start_date,
          endDate: product.warranty.end_date,
          durationMonths: product.warranty.duration_months,
          coverageLimitAmount:
            product.warranty.coverage_limit_amount?.toString() ?? null,
          maxClaimCount: product.warranty.max_claim_count,
          maxAmountPerClaim:
            product.warranty.max_amount_per_claim?.toString() ?? null,
          status: product.warranty.status,
          terms: product.warranty.terms,
        }
      : null,
    assets: mergeEffectiveProductAssets(
      templateResponse?.assets ?? [],
      productAssets,
    ),
  };
}

function mergeEffectiveMetadata(
  templateMetadata: Record<string, unknown> | null,
  productMetadata: unknown,
) {
  const physicalMetadata = isRecord(productMetadata) ? productMetadata : {};
  const sharedMetadata = templateMetadata ?? {};
  const merged = { ...sharedMetadata, ...physicalMetadata };
  return Object.keys(merged).length > 0 ? merged : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeEffectiveProductAssets<
  TTemplate extends {
    assetId: string;
    role: string;
    source?: 'PRODUCT' | 'TEMPLATE';
  },
  TProduct extends {
    assetId: string;
    role: string;
    source?: 'PRODUCT' | 'TEMPLATE';
  },
>(
  templateAssets: TTemplate[],
  productAssets: TProduct[],
): Array<TTemplate | TProduct> {
  const productHasCover = productAssets.some((asset) => asset.role === 'COVER');
  const seenAssetIds = new Set(productAssets.map((asset) => asset.assetId));
  const inheritedAssets = templateAssets.filter(
    (asset) =>
      !seenAssetIds.has(asset.assetId) &&
      !(asset.role === 'COVER' && productHasCover),
  );
  return [...inheritedAssets, ...productAssets];
}

export function toPublicProductSummary(
  product: ProductWithRelations,
  resolveAssetUrl: (asset: Asset) => string = (asset) => asset.path,
) {
  const cover = product.assets?.find((asset) => asset.role === 'COVER');
  const metadata = product.metadata as Record<string, unknown> | null;

  return {
    id: product.id,
    productCode: product.product_code,
    slug: product.slug,
    name: product.name,
    categoryId: product.category_id,
    category: product.category_ref
      ? {
          id: product.category_ref.id,
          slug: product.category_ref.slug,
          name: product.category_ref.name,
        }
      : null,
    brand: product.brand,
    model: product.model,
    description: product.description,
    coverImageUrl: cover ? resolveAssetUrl(cover.asset) : null,
    specifications: toPublicSpecifications(metadata?.specifications),
    warrantyDurationMonths: product.warranty?.duration_months ?? null,
    publishedAt: product.published_at!,
  };
}

function toPublicSpecifications(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const key = 'key' in item ? item.key : undefined;
    const specificationValue = 'value' in item ? item.value : undefined;
    if (typeof key !== 'string' || typeof specificationValue !== 'string') {
      return [];
    }

    return [{ key, value: specificationValue }];
  });
}
