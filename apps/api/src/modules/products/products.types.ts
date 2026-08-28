import {
  Asset,
  Category,
  Customer,
  Product,
  ProductAsset,
  ProductOwnership,
  Warranty,
  ProductTemplate,
  ProductTemplateAsset,
  warranty_status,
} from '@prisma/client';
import { toCategoryResponse } from '@/modules/categories/categories.types';
import {
  ProductTemplateWithRelations,
  toProductTemplateResponse,
} from '@/modules/product-templates/product-templates.types';

type ProductCatalogueSnapshot = Pick<
  Product,
  | 'catalogue_name'
  | 'catalogue_sku'
  | 'catalogue_slug'
  | 'catalogue_brand'
  | 'catalogue_model'
  | 'catalogue_model_year'
  | 'catalogue_description'
  | 'catalogue_metadata'
>;

// Snapshot columns are nullable during the expand/backfill release. Keeping
// them optional here lets existing repository fixtures and the legacy
// template-backed read path continue to work until the cut-over release.
type ProductWithRelations = Omit<Product, keyof ProductCatalogueSnapshot> &
  Partial<ProductCatalogueSnapshot> & {
    assets?: Array<ProductAsset & { asset: Asset }>;
    ownerships?: Array<ProductOwnership & { customer?: Customer }>;
    warranty?: Warranty | null;
    warranty_activation_requests?: Array<{ id: string }>;
    template?: ProductTemplateWithRelations | null;
    category_ref?: Category;
  };

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
  const warrantyCodeEditLockedReason =
    product.warranty && product.warranty.status !== warranty_status.DRAFT
      ? ('WARRANTY_NOT_DRAFT' as const)
      : product.warranty_activation_requests?.length
        ? ('OPEN_ACTIVATION_REQUEST' as const)
        : null;

  return {
    id: product.id,
    templateId: product.template_id,
    template: templateResponse,
    productCode: product.product_code,
    slug: templateResponse?.slug ?? '',
    warrantyCode: product.warranty?.warranty_code ?? null,
    canEditWarrantyCode: warrantyCodeEditLockedReason === null,
    warrantyCodeEditLockedReason,
    serialNumber: product.serial_number,
    displayName: product.display_name,
    name:
      templateResponse?.name ?? product.display_name ?? product.product_code,
    categoryId: product.category_id,
    categoryRef: product.category_ref
      ? toCategoryResponse(product.category_ref)
      : null,
    brand: templateResponse?.brand ?? null,
    model: templateResponse?.model ?? null,
    modelYear: templateResponse?.modelYear ?? null,
    description: templateResponse?.description ?? null,
    status: product.status,
    metadata: effectiveMetadata,
    isPublished: templateResponse?.isPublished ?? false,
    publishedAt: templateResponse?.publishedAt ?? null,
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
  template: PublicProductTemplateWithRelations,
  resolveAssetUrl: (asset: Asset) => string = (asset) => asset.path,
) {
  const cover = template.assets.find((asset) => asset.role === 'COVER');
  const metadata = isRecord(template.metadata) ? template.metadata : {};

  return {
    id: template.id,
    sku: template.sku,
    slug: template.slug,
    name: template.name,
    categoryId: template.category_id,
    category: {
      id: template.category_ref.id,
      slug: template.category_ref.slug,
      name: template.category_ref.name,
    },
    brand: template.brand,
    model: template.model,
    description: template.description,
    coverImageUrl: cover ? resolveAssetUrl(cover.asset) : null,
    specifications: toPublicSpecifications(metadata.specifications),
    warrantyDurationMonths: template.default_warranty_duration_months,
    publishedAt: template.published_at ?? template.created_at,
  };
}

type PublicProductTemplateWithRelations = ProductTemplate & {
  assets: Array<ProductTemplateAsset & { asset: Asset }>;
  category_ref: Category;
};

export function toPublicProductDetail(
  template: PublicProductTemplateWithRelations,
  resolveAssetUrl: (asset: Asset) => string = (asset) => asset.path,
) {
  const metadata = isRecord(template.metadata) ? template.metadata : {};
  const images = template.assets.map((templateAsset) => ({
    id: templateAsset.id,
    url: resolveAssetUrl(templateAsset.asset),
    altText: templateAsset.alt_text,
    sortOrder: templateAsset.sort_order,
  }));
  const coverIndex = template.assets.findIndex(
    (templateAsset) => templateAsset.role === 'COVER',
  );

  return {
    id: template.id,
    sku: template.sku,
    slug: template.slug,
    name: template.name,
    category: {
      id: template.category_ref.id,
      slug: template.category_ref.slug,
      name: template.category_ref.name,
    },
    brand: template.brand,
    model: template.model,
    modelYear: template.model_year,
    shortDescription:
      typeof metadata.shortDescription === 'string'
        ? metadata.shortDescription
        : null,
    description: template.description,
    coverImage: coverIndex >= 0 ? images[coverIndex] : null,
    galleryImages: images.filter(
      (_, index) =>
        index !== coverIndex && template.assets[index]?.role === 'GALLERY',
    ),
    specifications: toPublicSpecifications(metadata.specifications),
    features: toPublicStringList(metadata.features),
    applications: toPublicStringList(metadata.applications),
    warranty: {
      durationMonths: template.default_warranty_duration_months,
      terms: template.default_warranty_terms,
    },
    publishedAt: template.published_at,
  };
}

function toPublicSpecifications(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const key = item.key;
    const specificationValue = item.value;
    if (typeof key !== 'string' || typeof specificationValue !== 'string') {
      return [];
    }
    const group = item.group;

    return [
      {
        key,
        value: specificationValue,
        ...(typeof group === 'string' ? { group } : {}),
      },
    ];
  });
}

function toPublicStringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}
