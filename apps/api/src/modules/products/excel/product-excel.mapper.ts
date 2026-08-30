import { ProductExcelRow } from '@/modules/products/excel/product-excel.types';
import { Category, Product, Warranty } from '@prisma/client';

type ProductWithExportRelations = Product & {
  category_ref?: Category;
  warranty?: Warranty | null;
};

export function toProductExcelRow(
  product: ProductWithExportRelations,
): ProductExcelRow {
  const metadata = product.metadata as Record<string, unknown> | null;
  const installationPosition =
    typeof metadata?.installationPosition === 'string'
      ? metadata.installationPosition
      : null;
  const shortDescription =
    typeof metadata?.shortDescription === 'string'
      ? metadata.shortDescription
      : null;

  return {
    productCode: product.product_code,
    displayName: product.display_name?.trim() || product.product_code,
    categoryCode: product.category_ref?.code ?? product.category_id,
    brand: product.brand,
    model: product.model,
    modelYear: product.model_year,
    shortDescription,
    description: product.description,
    warrantyDurationMonths: product.warranty?.duration_months ?? 0,
    warrantyTerms: product.warranty?.terms ?? null,
    installationPosition,
    warrantyCode: product.warranty?.warranty_code ?? null,
    serialNumber: product.serial_number,
    status: product.status,
  };
}
