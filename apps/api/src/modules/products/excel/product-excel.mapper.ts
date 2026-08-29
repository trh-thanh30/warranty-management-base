import { ProductExcelRow } from '@/modules/products/excel/product-excel.types';
import { Category, Product, ProductTemplate, Warranty } from '@prisma/client';

type ProductWithExportRelations = Product & {
  template?: ProductTemplate | null;
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

  return {
    productCode: product.product_code,
    productName:
      product.catalogue_name ??
      product.template?.name ??
      product.display_name ??
      product.product_code,
    categoryCode: product.category_ref?.code ?? product.category_id,
    brand: product.catalogue_brand ?? product.template?.brand ?? null,
    model: product.catalogue_model ?? product.template?.model ?? null,
    modelYear:
      product.catalogue_model_year ?? product.template?.model_year ?? null,
    warrantyDurationMonths: product.warranty?.duration_months ?? 0,
    warrantyTerms: product.warranty?.terms ?? null,
    displayName: product.display_name,
    installationPosition,
    warrantyCode: product.warranty?.warranty_code ?? null,
    serialNumber: product.serial_number,
    status: product.status,
  };
}
