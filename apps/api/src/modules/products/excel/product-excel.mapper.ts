import { ProductExcelRow } from '@/modules/products/excel/product-excel.types';
import {
  Asset,
  Category,
  Product,
  ProductAsset,
  Warranty,
} from '@prisma/client';

type ProductWithExportRelations = Product & {
  assets?: Array<ProductAsset & { asset: Asset }>;
  category_ref?: Category | null;
  warranty?: Warranty | null;
};

export function toProductExcelRow(
  product: ProductWithExportRelations,
  resolveAssetUrl: (asset: Asset) => string = (asset) => asset.path,
): ProductExcelRow {
  const imageAsset =
    product.assets?.find((productAsset) => productAsset.role === 'COVER') ??
    product.assets?.[0];

  return {
    productCode: product.product_code,
    name: product.name,
    imageUrl: imageAsset ? resolveAssetUrl(imageAsset.asset) : null,
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
