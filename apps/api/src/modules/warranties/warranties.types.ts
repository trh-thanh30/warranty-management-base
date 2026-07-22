import {
  Customer,
  Product,
  ProductOwnership,
  User,
  Warranty,
} from '@prisma/client';

type WarrantyWithProduct = Warranty & {
  activated_by?: User | null;
  voided_by?: User | null;
  product: Product & {
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
  product: Product;
  warranty: Warranty;
}) {
  return {
    product: {
      id: input.product.id,
      name: input.product.name,
      brand: input.product.brand,
      model: input.product.model,
      serialNumber: input.product.serial_number,
      warrantyCode: input.product.warranty_code,
    },
    warranty: {
      warrantyCode: input.warranty.warranty_code,
      startDate: input.warranty.start_date,
      endDate: input.warranty.end_date,
      status: input.warranty.status,
    },
  };
}

export function toWarrantyListItemResponse(warranty: WarrantyWithProduct) {
  const currentOwnership = warranty.product.ownerships?.find(
    (ownership) => ownership.is_current_owner,
  );

  return {
    ...toWarrantyResponse(warranty),
    product: {
      id: warranty.product.id,
      name: warranty.product.name,
      brand: warranty.product.brand,
      model: warranty.product.model,
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
