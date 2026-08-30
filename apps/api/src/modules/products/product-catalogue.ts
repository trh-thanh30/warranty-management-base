export type ProductCatalogueSource = {
  product_code: string;
  display_name?: string | null;
  slug: string;
  brand?: string | null;
  model?: string | null;
  model_year?: number | null;
  description?: string | null;
  metadata?: unknown;
};

export function getProductCatalogue(product: ProductCatalogueSource) {
  return {
    name: product.display_name ?? product.product_code,
    sku: product.product_code,
    slug: product.slug,
    brand: product.brand ?? null,
    model: product.model ?? null,
    modelYear: product.model_year ?? null,
    description: product.description ?? null,
    metadata: product.metadata ?? null,
  };
}

export function getProductDisplayName(product: ProductCatalogueSource) {
  return product.display_name ?? getProductCatalogue(product).name;
}
