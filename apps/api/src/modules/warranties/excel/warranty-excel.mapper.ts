import { WarrantyExcelRow } from '@/modules/warranties/excel/warranty-excel.types';
import { Customer, Product, ProductOwnership, Warranty } from '@prisma/client';

type WarrantyWithProduct = Warranty & {
  product: Product & {
    ownerships?: Array<ProductOwnership & { customer?: Customer }>;
  };
};

export function toWarrantyExcelRow(
  warranty: WarrantyWithProduct,
): WarrantyExcelRow {
  const currentOwnership = warranty.product.ownerships?.find(
    (ownership) => ownership.is_current_owner,
  );

  return {
    warrantyCode: warranty.warranty_code,
    productCode: warranty.product.product_code,
    productName: warranty.product.name,
    serialNumber: warranty.product.serial_number,
    ownerCustomerCode: currentOwnership?.customer?.customer_code ?? null,
    ownerFullName: currentOwnership?.customer?.full_name ?? null,
    startDate: warranty.start_date,
    endDate: warranty.end_date,
    durationMonths: warranty.duration_months,
    coverageLimitAmount: warranty.coverage_limit_amount?.toString() ?? null,
    maxClaimCount: warranty.max_claim_count,
    maxAmountPerClaim: warranty.max_amount_per_claim?.toString() ?? null,
    status: warranty.status,
    terms: warranty.terms,
  };
}
