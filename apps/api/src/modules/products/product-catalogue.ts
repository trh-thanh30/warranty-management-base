type LegacyTemplateCatalogue = {
  [key: string]: unknown;
  name: string;
  sku?: string;
  slug?: string;
  brand?: string | null;
  model?: string | null;
  model_year?: number | null;
  description?: string | null;
  metadata?: unknown;
  is_published?: boolean;
  published_at?: Date | null;
};

export type ProductCatalogueSource = {
  product_code: string;
  display_name?: string | null;
  catalogue_name?: string | null;
  catalogue_sku?: string | null;
  catalogue_slug?: string | null;
  catalogue_brand?: string | null;
  catalogue_model?: string | null;
  catalogue_model_year?: number | null;
  catalogue_description?: string | null;
  catalogue_metadata?: unknown;
  template?: LegacyTemplateCatalogue | null;
};

export function getProductCatalogue(product: ProductCatalogueSource) {
  return {
    name:
      product.catalogue_name ??
      product.template?.name ??
      product.display_name ??
      product.product_code,
    sku: product.catalogue_sku ?? product.template?.sku ?? product.product_code,
    slug: product.catalogue_slug ?? product.template?.slug ?? '',
    brand: product.catalogue_brand ?? product.template?.brand ?? null,
    model: product.catalogue_model ?? product.template?.model ?? null,
    modelYear:
      product.catalogue_model_year ?? product.template?.model_year ?? null,
    description:
      product.catalogue_description ?? product.template?.description ?? null,
    metadata: product.catalogue_metadata ?? product.template?.metadata ?? null,
  };
}

export function getProductDisplayName(product: ProductCatalogueSource) {
  return product.display_name ?? getProductCatalogue(product).name;
}
