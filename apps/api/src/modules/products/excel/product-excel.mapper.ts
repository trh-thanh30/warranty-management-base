import { ProductExcelRow } from '@/modules/products/excel/product-excel.types';
import { Category, Product } from '@prisma/client';

type ProductWithExportRelations = Product & {
  category_ref?: Category;
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
    warrantyDurationMonths: product.warranty_duration_months ?? 0,
    warrantyTerms: product.warranty_terms,
    installationPosition,
    status: product.status,
  };
}
