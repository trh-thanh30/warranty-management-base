import { ProductFormView } from "@/src/views/products/product-form.view";

type EditProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { productId } = await params;

  return <ProductFormView mode="edit" productId={productId} />;
}
