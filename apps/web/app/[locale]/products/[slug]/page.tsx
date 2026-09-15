import { PUBLIC_FEATURES } from "@/src/config/public-features.config";
import { ProductDetailView } from "@/src/views/product-detail/product-detail.view";
import { notFound } from "next/navigation";

interface ProductsDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductsDetailPage({
  params,
}: ProductsDetailPageProps) {
  if (!PUBLIC_FEATURES.pages.products) {
    notFound();
  }

  const { slug } = await params;
  return <ProductDetailView slug={slug} />;
}
