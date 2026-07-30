import { ProductExcelRow } from '@/modules/products/excel/product-excel.types';
import { Product, ProductTemplate, Warranty } from '@prisma/client';

type ProductWithExportRelations = Product & {
  template?: ProductTemplate;
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
    templateSku: product.template?.sku ?? '',
    displayName: product.display_name,
    installationPosition,
    warrantyCode: product.warranty?.warranty_code ?? null,
    serialNumber: product.serial_number,
    status: product.status,
  };
}
