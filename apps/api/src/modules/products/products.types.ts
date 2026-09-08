import {
  Asset,
  ActivationCode,
  ActivationCodeBatch,
  Category,
  Customer,
  Product,
  ProductAsset,
  Warranty,
  WarrantyOwnership,
  warranty_status,
  warranty_activation_request_status,
} from '@prisma/client';
import { toCategoryResponse } from '@/modules/categories/categories.types';
import { getProductCatalogue } from '@/modules/products/product-catalogue';

type ProductActivationCodeRelation = Pick<
  ActivationCode,
  'id' | 'code_ciphertext' | 'status' | 'expires_at'
> & {
  batch: Pick<ActivationCodeBatch, 'batch_code'>;
  request: { id: string; status: warranty_activation_request_status } | null;
  request_items: Array<{
    id: string;
    status: warranty_activation_request_status;
  }>;
  warranty: { id: string } | null;
};

type ProductWithRelations = Product & {
  assets?: Array<ProductAsset & { asset: Asset }>;
  warranty?:
    | (Warranty & {
        ownerships?: Array<WarrantyOwnership & { customer?: Customer }>;
      })
    | null;
  warranty_activation_requests?: Array<{ id: string }>;
  category_ref?: Category;
  activation_codes?: ProductActivationCodeRelation[];
  /** Legacy test/consumer shape kept only while clients migrate. */
  activation_code?: ProductActivationCodeRelation | null;
};

export function toProductResponse(
  product: ProductWithRelations,
  resolveAssetUrl: (asset: Asset) => string = (asset) => asset.path,
  decryptActivationCode?: (ciphertext: string) => string,
) {
  const currentOwnership = product.warranty?.ownerships?.find(
    (ownership) => ownership.is_current_owner,
  );
  const catalogue = getProductCatalogue(product);
  const effectiveMetadata = isRecord(product.metadata)
    ? product.metadata
    : null;
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
    })) ?? [];
  const warrantyCodeEditLockedReason =
    product.warranty && product.warranty.status !== warranty_status.DRAFT
      ? ('WARRANTY_NOT_DRAFT' as const)
      : product.warranty_activation_requests?.length
        ? ('OPEN_ACTIVATION_REQUEST' as const)
        : null;
  const sourceActivationCodes =
    product.activation_codes ??
    (product.activation_code ? [product.activation_code] : []);
  const assignedActivationCodes = sourceActivationCodes.map(
    (activationCode) => {
      const status = getAssignedActivationCodeStatus(activationCode);
      return {
        id: activationCode.id,
        code: requireActivationCodeDecryptor(decryptActivationCode)(
          activationCode.code_ciphertext,
        ),
        status,
        expiresAt: activationCode.expires_at,
        batchCode: activationCode.batch.batch_code,
        canReplace: status === 'AVAILABLE',
        unavailableReason: status === 'AVAILABLE' ? null : status,
      };
    },
  );
  const assignedActivationCode = assignedActivationCodes[0] ?? null;

  return {
    id: product.id,
    sku: product.product_code,
    productCode: product.product_code,
    slug: catalogue.slug,
    warrantyCode: product.warranty?.warranty_code ?? null,
    canEditWarrantyCode: warrantyCodeEditLockedReason === null,
    warrantyCodeEditLockedReason,
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
    catalogueMetadata: effectiveMetadata,
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
          serialNumber: product.warranty.serial_number,
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
    warrantyDurationMonths: product.warranty_duration_months,
    warrantyTerms: product.warranty_terms,
    // Keep the singular field during the contract transition. New callers
    // should use assignedActivationCodes.
    assignedActivationCode,
    assignedActivationCodes,
    assets: productAssets,
  };
}

function getAssignedActivationCodeStatus(code: ProductActivationCodeRelation) {
  if (code.warranty || code.status === 'ACTIVATED') return 'ACTIVATED' as const;
  if (
    (code.request && ['PENDING', 'APPROVED'].includes(code.request.status)) ||
    code.request_items.some((item) =>
      ['PENDING', 'APPROVED'].includes(item.status),
    )
  ) {
    return 'PENDING_APPROVAL' as const;
  }
  if (code.status === 'AVAILABLE' && code.expires_at.getTime() <= Date.now()) {
    return 'EXPIRED' as const;
  }
  return code.status;
}

function requireActivationCodeDecryptor(
  decryptActivationCode?: (ciphertext: string) => string,
) {
  if (!decryptActivationCode) {
    throw new Error(
      'An activation-code decryptor is required for assigned product codes',
    );
  }
  return decryptActivationCode;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function toPublicProductSummary(
  product: PublicProductWithRelations,
  resolveAssetUrl: (asset: Asset) => string = (asset) => asset.path,
) {
  const cover = product.assets.find((asset) => asset.role === 'COVER');
  const metadata = isRecord(product.metadata) ? product.metadata : {};

  return {
    id: product.id,
    sku: product.product_code,
    slug: product.slug ?? product.product_code.toLowerCase(),
    name: product.display_name ?? product.product_code,
    categoryId: product.category_id,
    category: {
      id: product.category_ref.id,
      slug: product.category_ref.slug,
      name: product.category_ref.name,
    },
    brand: product.brand,
    model: product.model,
    description: product.description,
    coverImageUrl: cover ? resolveAssetUrl(cover.asset) : null,
    specifications: toPublicSpecifications(metadata.specifications),
    warrantyDurationMonths: product.warranty_duration_months ?? 0,
    publishedAt: product.published_at ?? product.created_at,
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
  const metadata = isRecord(product.metadata) ? product.metadata : {};
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
    sku: product.product_code,
    slug: product.slug ?? product.product_code.toLowerCase(),
    name: product.display_name ?? product.product_code,
    category: {
      id: product.category_ref.id,
      slug: product.category_ref.slug,
      name: product.category_ref.name,
    },
    brand: product.brand,
    model: product.model,
    modelYear: product.model_year,
    shortDescription:
      typeof metadata.shortDescription === 'string'
        ? metadata.shortDescription
        : null,
    description: product.description,
    coverImage: coverIndex >= 0 ? images[coverIndex] : null,
    galleryImages: images.filter(
      (_, index) =>
        index !== coverIndex && product.assets[index]?.role === 'GALLERY',
    ),
    specifications: toPublicSpecifications(metadata.specifications),
    features: toPublicStringList(metadata.features),
    applications: toPublicStringList(metadata.applications),
    warranty: {
      durationMonths: product.warranty_duration_months ?? 0,
      terms: product.warranty_terms,
    },
    publishedAt: product.published_at,
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
