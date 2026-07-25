import { ProductFormView } from "@/src/views/products/product-form.view";

export default async function CreateProductPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; templateId?: string }>;
}) {
  const query = await searchParams;
  const createMode =
    query.mode === "from-template" ? "from-template" : "independent";
  return (
    <ProductFormView
      createMode={createMode}
      mode="create"
      templateId={query.templateId}
    />
  );
}
