import { Customer, Product, ProductOwnership, Warranty } from '@prisma/client';

type WarrantyWithProduct = Warranty & {
  product: Product & {
    ownerships?: Array<ProductOwnership & { customer?: Customer }>;
  };
};

export function toWarrantyResponse(warranty: Warranty) {
  return {
    id: warranty.id,
    productId: warranty.product_id,
    warrantyCode: warranty.warranty_code,
    startDate: warranty.start_date,
    endDate: warranty.end_date,
    durationMonths: warranty.duration_months,
    status: warranty.status,
    terms: warranty.terms,
    metadata: warranty.metadata as Record<string, unknown> | null,
    createdAt: warranty.created_at,
    updatedAt: warranty.updated_at,
  };
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
