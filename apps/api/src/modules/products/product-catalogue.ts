export type ProductCatalogueSource = {
  product_code: string;
  display_name?: string | null;
  catalogue_name: string;
  catalogue_sku: string;
  catalogue_slug: string;
  catalogue_brand?: string | null;
  catalogue_model?: string | null;
  catalogue_model_year?: number | null;
  catalogue_description?: string | null;
  catalogue_metadata?: unknown;
  brand?: string | null;
  model?: string | null;
  model_year?: number | null;
  description?: string | null;
  slug?: string | null;
  is_published?: boolean;
  published_at?: Date | null;
};

export function getProductCatalogue(product: ProductCatalogueSource) {
  return {
    name: product.display_name ?? product.catalogue_name,
    sku: product.product_code,
    slug: product.slug ?? product.catalogue_slug,
    brand: product.brand ?? product.catalogue_brand ?? null,
    model: product.model ?? product.catalogue_model ?? null,
    modelYear: product.model_year ?? product.catalogue_model_year ?? null,
    description: product.description ?? product.catalogue_description ?? null,
    metadata: product.catalogue_metadata ?? null,
  };
}

export function getProductDisplayName(product: ProductCatalogueSource) {
  return product.display_name ?? getProductCatalogue(product).name;
}
