import { ProductDetailView } from "@/src/views/product-detail/product-detail.view";

interface ProductsDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductsDetailPage({
  params,
}: ProductsDetailPageProps) {
  const { slug } = await params;
  return <ProductDetailView slug={slug} />;
}
