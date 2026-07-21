import { ProductExcelRow } from '@/modules/products/excel/product-excel.types';
import { Category, Product, Warranty } from '@prisma/client';

type ProductWithExportRelations = Product & {
  category_ref?: Category | null;
  warranty?: Warranty | null;
};

export function toProductExcelRow(
  product: ProductWithExportRelations,
): ProductExcelRow {
  return {
    productCode: product.product_code,
    name: product.name,
    category: product.category,
    categoryCode: product.category_ref?.code ?? null,
    brand: product.brand,
    model: product.model,
    manufactureYear: product.manufacture_year,
    serialNumber: product.serial_number,
    status: product.status,
    warrantyDurationMonths: product.warranty?.duration_months ?? null,
    warrantyTerms: product.warranty?.terms ?? null,
    description: product.description,
  };
}
