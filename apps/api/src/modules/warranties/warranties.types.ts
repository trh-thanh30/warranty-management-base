import {
  Category,
  Customer,
  Product,
  ProductOwnership,
  ProductTemplate,
  User,
  Warranty,
  WarrantyActivationRequest,
} from '@prisma/client';

type WarrantyWithProduct = Warranty & {
  activated_by?: User | null;
  voided_by?: User | null;
  product: Product & {
    template: ProductTemplate;
    ownerships?: Array<ProductOwnership & { customer?: Customer }>;
  };
};

type WarrantyWithAuditUsers = Warranty & {
  activated_by?: User | null;
  voided_by?: User | null;
};

export function toWarrantyResponse(warranty: WarrantyWithAuditUsers) {
  return {
    id: warranty.id,
    productId: warranty.product_id,
    warrantyCode: warranty.warranty_code,
    startDate: warranty.start_date,
    endDate: warranty.end_date,
    durationMonths: warranty.duration_months,
    coverageLimitAmount: warranty.coverage_limit_amount?.toString() ?? null,
    maxClaimCount: warranty.max_claim_count,
    maxAmountPerClaim: warranty.max_amount_per_claim?.toString() ?? null,
    status: warranty.status,
    terms: warranty.terms,
    metadata: warranty.metadata as Record<string, unknown> | null,
    activatedByUserId: warranty.activated_by_id,
    activatedByUser: getWarrantyUserSummary(
      'activated_by' in warranty ? warranty.activated_by : null,
    ),
    voidedAt: warranty.voided_at,
    voidedByUserId: warranty.voided_by_id,
    voidedByUser: getWarrantyUserSummary(
      'voided_by' in warranty ? warranty.voided_by : null,
    ),
    voidReason: warranty.void_reason,
    createdAt: warranty.created_at,
    updatedAt: warranty.updated_at,
  };
}

function getWarrantyUserSummary(user: User | null | undefined) {
  return user
    ? {
        id: user.id,
        email: user.email,
        name: user.full_name,
      }
    : null;
}

export function toWarrantyLookupResponse(input: {
  product: Product & {
    template: ProductTemplate & { category_ref?: Category | null };
  };
  warranty: Warranty & {
    activation_request?: WarrantyActivationRequest | null;
  };
}) {
  const activationRequest = input.warranty.activation_request;

  return {
    product: {
      id: input.product.id,
      productCode: input.product.product_code,
      name: input.product.template.name,
      displayName: input.product.display_name,
      brand: input.product.template.brand,
      model: input.product.template.model,
      serialNumber: input.product.serial_number,
      warrantyCode: input.warranty.warranty_code,
      category: input.product.template.category_ref
        ? {
            id: input.product.template.category_ref.id,
            name: input.product.template.category_ref.name,
            slug: input.product.template.category_ref.slug,
          }
        : null,
    },
    warranty: {
      warrantyCode: input.warranty.warranty_code,
      startDate: input.warranty.start_date,
      endDate: input.warranty.end_date,
      durationMonths: input.warranty.duration_months,
      terms: input.warranty.terms,
      status: input.warranty.status,
    },
    installation: activationRequest
      ? {
          installedAt: activationRequest.installed_at,
          vehicleModel: activationRequest.vehicle_model,
          dealer: getPublicDealer(activationRequest.metadata),
          filmItems: getPublicFilmItems(activationRequest.metadata),
        }
      : null,
  };
}

const FILM_ITEM_KEYS = [
  'windshield',
  'frontLeftSide',
  'frontRightSide',
  'rearLeftSide',
  'rearRightSide',
  'sunroof',
  'rearGlass',
] as const;

function getPublicDealer(metadata: unknown) {
  const dealer = toRecord(toRecord(metadata)?.dealer);
  if (!dealer) return null;

  const result = {
    id: toOptionalString(dealer.id),
    name: toOptionalString(dealer.name),
    phone: toOptionalString(dealer.phone),
    address: toOptionalString(dealer.address),
    province: toOptionalString(dealer.province),
    district: toOptionalString(dealer.district),
  };

  return Object.values(result).some(Boolean) ? result : null;
}

function getPublicFilmItems(metadata: unknown) {
  const filmItems = toRecord(toRecord(metadata)?.filmItems);
  if (!filmItems) return null;

  const result = Object.fromEntries(
    FILM_ITEM_KEYS.flatMap((key) => {
      const value = toOptionalString(filmItems[key]);
      return value ? [[key, value]] : [];
    }),
  );

  return Object.keys(result).length > 0 ? result : null;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function toWarrantyListItemResponse(warranty: WarrantyWithProduct) {
  const currentOwnership = warranty.product.ownerships?.find(
    (ownership) => ownership.is_current_owner,
  );

  return {
    ...toWarrantyResponse(warranty),
    product: {
      id: warranty.product.id,
      name: warranty.product.template.name,
      displayName: warranty.product.display_name,
      brand: warranty.product.template.brand,
      model: warranty.product.template.model,
      productCode: warranty.product.product_code,
      serialNumber: warranty.product.serial_number,
    },
    owner: currentOwnership
      ? {
          customerId: currentOwnership.customer_id,
          ownerUserId: currentOwnership.owner_user_id,
          customerCode: currentOwnership.customer?.customer_code,
          fullName: currentOwnership.customer?.full_name,
        }
      : null,
  };
}
