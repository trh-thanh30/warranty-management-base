import { ProductFormView } from "@/src/views/products/product-form.view";

export default async function CreateProductPage({
  searchParams,
}: {
  searchParams: Promise<{ templateId?: string }>;
}) {
  const query = await searchParams;
  return <ProductFormView mode="create" templateId={query.templateId} />;
}
