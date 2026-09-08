import { ProductActivationCodesView } from "@/src/views/activation-code-batches/product-activation-codes.view";

export default async function ProductActivationCodesPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  return <ProductActivationCodesView productId={productId} />;
}
