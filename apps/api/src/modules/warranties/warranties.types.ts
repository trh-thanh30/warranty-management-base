import { Product, Warranty } from '@prisma/client';

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
