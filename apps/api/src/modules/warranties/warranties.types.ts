import {
  Category,
  ActivationCode,
  Customer,
  Dealer,
  Product,
  WarrantyOwnership,
  User,
  Warranty,
  WarrantyActivationRequest,
} from '@prisma/client';
import { getProductCatalogue } from '@/modules/products/product-catalogue';

export const WARRANTY_STATUS = {
  ACTIVE: 'ACTIVE',
  DRAFT: 'DRAFT',
  EXPIRED: 'EXPIRED',
  VOIDED: 'VOIDED',
} as const;

export type WarrantyStatus =
  (typeof WARRANTY_STATUS)[keyof typeof WARRANTY_STATUS];

export const WARRANTY_CLAIM_STATUS = {
  APPROVED: 'APPROVED',
  IN_REPAIR: 'IN_REPAIR',
  REVIEWING: 'REVIEWING',
  SUBMITTED: 'SUBMITTED',
} as const;

export type WarrantyClaimStatus =
  (typeof WARRANTY_CLAIM_STATUS)[keyof typeof WARRANTY_CLAIM_STATUS];

export const WARRANTY_ACTIVATION_REQUEST_STATUS = {
  APPROVED: 'APPROVED',
  CANCELLED: 'CANCELLED',
  PENDING: 'PENDING',
} as const;

export type WarrantyActivationRequestStatus =
  (typeof WARRANTY_ACTIVATION_REQUEST_STATUS)[keyof typeof WARRANTY_ACTIVATION_REQUEST_STATUS];

type WarrantyUserSummary = {
  email: string;
  fullName: string | null;
  id: string;
};

export type WarrantyRecord = {
  activatedBy?: WarrantyUserSummary | null;
  activatedById: string | null;
  coverageLimitAmount: { toString(): string } | null;
  createdAt: Date;
  durationMonths: number;
  endDate: Date | null;
  id: string;
  maxAmountPerClaim: { toString(): string } | null;
  maxClaimCount: number | null;
  metadata: unknown;
  productId: string;
  startDate: Date | null;
  status: WarrantyStatus;
  serialNumber: string | null;
  terms: string | null;
  updatedAt: Date;
  voidReason: string | null;
  voidedAt: Date | null;
  voidedBy?: WarrantyUserSummary | null;
  voidedById: string | null;
  warrantyCode: string | null;
  dealer: {
    id: string;
    dealerCode: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    province?: string | null;
    district?: string | null;
  } | null;
  owner: {
    customerId: string;
    customerCode: string | null;
    fullName: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    ownerUserId: string | null;
  } | null;
};

export type ManualActivationProduct = {
  deletedAt: Date | null;
  displayName: string | null;
  id: string;
  ownerships: Array<{
    customer: {
      address: string | null;
      customerCode: string;
      email: string | null;
      fullName: string;
      id: string;
      phone: string | null;
    };
    isCurrentOwner: boolean;
  }>;
  productCode: string;
  serialNumber: string | null;
  catalogue: {
    brand: string | null;
    model: string | null;
    name: string;
  };
  warranty: WarrantyRecord | null;
};

export type WarrantyCustomer = {
  address: string | null;
  customerCode: string;
  email: string | null;
  fullName: string;
  id: string;
  phone: string | null;
  userId: string | null;
};

export type WarrantyActivationCandidate = {
  currentOwnershipId: string | null;
  durationMonths: number;
  id: string;
  status: WarrantyStatus;
  warrantyCode: string | null;
};

export type WarrantyVoidCandidate = {
  id: string;
  status: WarrantyStatus;
  warrantyCode: string | null;
};

type WarrantyWithProduct = Warranty & {
  activation_request?: WarrantyActivationRequest | null;
  activation_code?: Pick<
    ActivationCode,
    'id' | 'code_ciphertext' | 'status'
  > | null;
  activated_by?: User | null;
  voided_by?: User | null;
  dealer?: Dealer | null;
  ownerships?: Array<WarrantyOwnership & { customer?: Customer | null }>;
  product: Product & { category_ref?: Category | null };
};

type WarrantyWithAuditUsers = WarrantyRecord & {
  activatedBy?: WarrantyUserSummary | null;
  voidedBy?: WarrantyUserSummary | null;
};

export function toWarrantyResponse(warranty: WarrantyWithAuditUsers) {
  return {
    id: warranty.id,
    productId: warranty.productId,
    warrantyCode: warranty.warrantyCode,
    startDate: warranty.startDate,
    endDate: warranty.endDate,
    durationMonths: warranty.durationMonths,
    coverageLimitAmount: warranty.coverageLimitAmount?.toString() ?? null,
    maxClaimCount: warranty.maxClaimCount,
    maxAmountPerClaim: warranty.maxAmountPerClaim?.toString() ?? null,
    status: warranty.status,
    serialNumber: warranty.serialNumber,
    terms: warranty.terms,
    metadata: warranty.metadata as Record<string, unknown> | null,
    activatedByUserId: warranty.activatedById,
    activatedByUser: warranty.activatedBy
      ? {
          id: warranty.activatedBy.id,
          email: warranty.activatedBy.email,
          name: warranty.activatedBy.fullName,
        }
      : null,
    voidedAt: warranty.voidedAt,
    voidedByUserId: warranty.voidedById,
    voidedByUser: warranty.voidedBy
      ? {
          id: warranty.voidedBy.id,
          email: warranty.voidedBy.email,
          name: warranty.voidedBy.fullName,
        }
      : null,
    voidReason: warranty.voidReason,
    createdAt: warranty.createdAt,
    updatedAt: warranty.updatedAt,
    dealer: warranty.dealer
      ? {
          id: warranty.dealer.id,
          dealerCode: warranty.dealer.dealerCode,
          name: warranty.dealer.name,
          ...(warranty.dealer.phone ? { phone: warranty.dealer.phone } : {}),
          ...(warranty.dealer.email ? { email: warranty.dealer.email } : {}),
          ...(warranty.dealer.address
            ? { address: warranty.dealer.address }
            : {}),
          ...(warranty.dealer.province
            ? { province: warranty.dealer.province }
            : {}),
          ...(warranty.dealer.district
            ? { district: warranty.dealer.district }
            : {}),
        }
      : null,
    owner: warranty.owner ?? null,
  };
}

export function toWarrantyLookupResponse(input: {
  product: Product & {
    category_ref?: Category | null;
  };
  warranty: Warranty & {
    activation_request?: WarrantyActivationRequest | null;
  };
}) {
  const activationRequest = input.warranty.activation_request;
  const catalogue = getProductCatalogue(input.product);
  const category = input.product.category_ref;

  return {
    product: {
      id: input.product.id,
      productCode: input.product.product_code,
      name: catalogue.name,
      displayName: input.product.display_name,
      brand: catalogue.brand,
      model: catalogue.model,
      serialNumber: input.warranty.serial_number,
      warrantyCode: input.warranty.warranty_code,
      category: category
        ? {
            id: category.id,
            name: category.name,
            slug: category.slug,
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

export function toWarrantyListItemResponse(
  warranty: WarrantyWithProduct,
  decryptActivationCode?: (ciphertext: string) => string,
) {
  const currentOwnership = warranty.ownerships?.find(
    (ownership) => ownership.is_current_owner,
  );
  const activationRequest =
    warranty.activation_request &&
    (!warranty.activation_request.customer_id ||
      warranty.activation_request.customer_id === currentOwnership?.customer_id)
      ? warranty.activation_request
      : null;

  return {
    ...toWarrantyResponse(toWarrantyRecord(warranty)),
    activationCode: warranty.activation_code
      ? {
          id: warranty.activation_code.id,
          code: decryptActivationCode
            ? decryptActivationCode(warranty.activation_code.code_ciphertext)
            : null,
          status: warranty.activation_code.status,
        }
      : null,
    product: {
      id: warranty.product.id,
      name: getProductCatalogue(warranty.product).name,
      displayName: warranty.product.display_name,
      brand: getProductCatalogue(warranty.product).brand,
      model: getProductCatalogue(warranty.product).model,
      productCode: warranty.product.product_code,
      serialNumber: warranty.serial_number,
      ...(warranty.product.category_ref
        ? {
            category: {
              id: warranty.product.category_ref.id,
              name: warranty.product.category_ref.name,
              slug: warranty.product.category_ref.slug,
            },
          }
        : {}),
    },
    owner: currentOwnership
      ? {
          customerId: currentOwnership.customer_id,
          ownerUserId: currentOwnership.owner_user_id,
          customerCode: currentOwnership.customer?.customer_code,
          fullName: currentOwnership.customer?.full_name,
          ...(currentOwnership.customer?.email ||
          activationRequest?.customer_email
            ? {
                email:
                  currentOwnership.customer?.email ??
                  activationRequest?.customer_email,
              }
            : {}),
          ...(currentOwnership.customer?.phone ||
          activationRequest?.customer_phone
            ? {
                phone:
                  currentOwnership.customer?.phone ??
                  activationRequest?.customer_phone,
              }
            : {}),
          ...(currentOwnership.customer?.address ||
          activationRequest?.full_address
            ? {
                address:
                  currentOwnership.customer?.address ??
                  activationRequest?.full_address,
              }
            : {}),
        }
      : null,
  };
}

export function toWarrantyRecord(
  warranty: Warranty & {
    activated_by?: User | null;
    voided_by?: User | null;
    dealer?: Dealer | null;
    ownerships?: Array<WarrantyOwnership & { customer?: Customer | null }>;
  },
): WarrantyRecord {
  const currentOwnership = warranty.ownerships?.find(
    (ownership) => ownership.is_current_owner,
  );
  return {
    activatedBy: warranty.activated_by
      ? {
          email: warranty.activated_by.email,
          fullName: warranty.activated_by.full_name,
          id: warranty.activated_by.id,
        }
      : null,
    activatedById: warranty.activated_by_id,
    coverageLimitAmount: warranty.coverage_limit_amount,
    createdAt: warranty.created_at,
    durationMonths: warranty.duration_months,
    endDate: warranty.end_date,
    id: warranty.id,
    maxAmountPerClaim: warranty.max_amount_per_claim,
    maxClaimCount: warranty.max_claim_count,
    metadata: warranty.metadata,
    productId: warranty.product_id,
    startDate: warranty.start_date,
    status: warranty.status,
    serialNumber: warranty.serial_number,
    terms: warranty.terms,
    updatedAt: warranty.updated_at,
    voidReason: warranty.void_reason,
    voidedAt: warranty.voided_at,
    voidedBy: warranty.voided_by
      ? {
          email: warranty.voided_by.email,
          fullName: warranty.voided_by.full_name,
          id: warranty.voided_by.id,
        }
      : null,
    voidedById: warranty.voided_by_id,
    warrantyCode: warranty.warranty_code,
    dealer: warranty.dealer
      ? {
          id: warranty.dealer.id,
          dealerCode: warranty.dealer.dealer_code,
          name: warranty.dealer.name,
          ...(warranty.dealer.phone ? { phone: warranty.dealer.phone } : {}),
          ...(warranty.dealer.email ? { email: warranty.dealer.email } : {}),
          ...(warranty.dealer.address
            ? { address: warranty.dealer.address }
            : {}),
          ...(warranty.dealer.province
            ? { province: warranty.dealer.province }
            : {}),
          ...(warranty.dealer.district
            ? { district: warranty.dealer.district }
            : {}),
        }
      : null,
    owner: currentOwnership
      ? {
          customerId: currentOwnership.customer_id,
          customerCode: currentOwnership.customer?.customer_code ?? null,
          fullName: currentOwnership.customer?.full_name ?? null,
          ...(currentOwnership.customer?.email
            ? { email: currentOwnership.customer.email }
            : {}),
          ...(currentOwnership.customer?.phone
            ? { phone: currentOwnership.customer.phone }
            : {}),
          ...(currentOwnership.customer?.address
            ? { address: currentOwnership.customer.address }
            : {}),
          ownerUserId: currentOwnership.owner_user_id,
        }
      : null,
  };
}
