import {
  Asset,
  Category,
  Customer,
  Product,
  ProductAsset,
  ProductOwnership,
  Warranty,
  warranty_status,
} from '@prisma/client';
import { toCategoryResponse } from '@/modules/categories/categories.types';
import {
  getProductCatalogue,
  type ProductCatalogueSource,
} from '@/modules/products/product-catalogue';

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
  | 'catalogue_is_published'
  | 'catalogue_published_at'
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
    template?: ProductCatalogueSource['template'];
    category_ref?: Category;
  };

export function toProductResponse(
  product: ProductWithRelations,
  resolveAssetUrl: (asset: Asset) => string = (asset) => asset.path,
) {
  const currentOwnership = product.ownerships?.find(
    (ownership) => ownership.is_current_owner,
  );
  const catalogue = getProductCatalogue(product);
  const catalogueMetadata = isRecord(product.catalogue_metadata)
    ? product.catalogue_metadata
    : isRecord(catalogue.metadata)
      ? catalogue.metadata
      : null;
  const effectiveMetadata = mergeEffectiveMetadata(
    catalogueMetadata ?? null,
    product.metadata,
  );
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
    sku: catalogue.sku,
    productCode: product.product_code,
    slug: catalogue.slug,
    warrantyCode: product.warranty?.warranty_code ?? null,
    canEditWarrantyCode: warrantyCodeEditLockedReason === null,
    warrantyCodeEditLockedReason,
    serialNumber: product.serial_number,
    displayName: product.display_name,
    name: catalogue.name,
    categoryId: product.category_id,
    categoryRef: product.category_ref
      ? toCategoryResponse(product.category_ref)
      : null,
    brand: catalogue.brand,
    model: catalogue.model,
    modelYear: catalogue.modelYear,
    description: catalogue.description,
    status: product.status,
    metadata: effectiveMetadata,
    isPublished:
      product.catalogue_is_published ?? product.template?.is_published ?? false,
    publishedAt:
      product.catalogue_published_at ?? product.template?.published_at ?? null,
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
    assets: productAssets,
  };
}

function mergeEffectiveMetadata(
  catalogueMetadata: Record<string, unknown> | null,
  productMetadata: unknown,
) {
  const physicalMetadata = isRecord(productMetadata) ? productMetadata : {};
  const sharedMetadata = catalogueMetadata ?? {};
  const merged = { ...sharedMetadata, ...physicalMetadata };
  return Object.keys(merged).length > 0 ? merged : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function toPublicProductSummary(
  product: PublicProductWithRelations,
  resolveAssetUrl: (asset: Asset) => string = (asset) => asset.path,
) {
  const cover = product.assets.find((asset) => asset.role === 'COVER');
  const metadata = isRecord(product.catalogue_metadata)
    ? product.catalogue_metadata
    : {};

  return {
    id: product.id,
    sku: product.catalogue_sku ?? product.product_code,
    slug: product.catalogue_slug ?? product.product_code.toLowerCase(),
    name:
      product.catalogue_name ?? product.display_name ?? product.product_code,
    categoryId: product.category_id,
    category: {
      id: product.category_ref.id,
      slug: product.category_ref.slug,
      name: product.category_ref.name,
    },
    brand: product.catalogue_brand,
    model: product.catalogue_model,
    description: product.catalogue_description,
    coverImageUrl: cover ? resolveAssetUrl(cover.asset) : null,
    specifications: toPublicSpecifications(metadata.specifications),
    warrantyDurationMonths: product.warranty?.duration_months ?? 0,
    publishedAt: product.catalogue_published_at ?? product.created_at,
  };
}

type PublicProductWithRelations = Product & {
  assets: Array<ProductAsset & { asset: Asset }>;
  category_ref: Category;
  warranty: Pick<Warranty, 'duration_months' | 'terms'> | null;
};

export function toPublicProductDetail(
  product: PublicProductWithRelations,
  resolveAssetUrl: (asset: Asset) => string = (asset) => asset.path,
) {
  const metadata = isRecord(product.catalogue_metadata)
    ? product.catalogue_metadata
    : {};
  const images = product.assets.map((productAsset) => ({
    id: productAsset.id,
    url: resolveAssetUrl(productAsset.asset),
    altText: productAsset.alt_text,
    sortOrder: productAsset.sort_order,
  }));
  const coverIndex = product.assets.findIndex(
    (productAsset) => productAsset.role === 'COVER',
  );

  return {
    id: product.id,
    sku: product.catalogue_sku ?? product.product_code,
    slug: product.catalogue_slug ?? product.product_code.toLowerCase(),
    name:
      product.catalogue_name ?? product.display_name ?? product.product_code,
    category: {
      id: product.category_ref.id,
      slug: product.category_ref.slug,
      name: product.category_ref.name,
    },
    brand: product.catalogue_brand,
    model: product.catalogue_model,
    modelYear: product.catalogue_model_year,
    shortDescription:
      typeof metadata.shortDescription === 'string'
        ? metadata.shortDescription
        : null,
    description: product.catalogue_description,
    coverImage: coverIndex >= 0 ? images[coverIndex] : null,
    galleryImages: images.filter(
      (_, index) =>
        index !== coverIndex && product.assets[index]?.role === 'GALLERY',
    ),
    specifications: toPublicSpecifications(metadata.specifications),
    features: toPublicStringList(metadata.features),
    applications: toPublicStringList(metadata.applications),
    warranty: {
      durationMonths: product.warranty?.duration_months ?? 0,
      terms: product.warranty?.terms ?? null,
    },
    publishedAt: product.catalogue_published_at,
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
