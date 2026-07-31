import { PUBLIC_FEATURES } from "@/src/config/public-features.config";
import { ProductsView } from "@/src/views/products/products.view";
import { notFound } from "next/navigation";

export default function ProductsPage() {
  if (!PUBLIC_FEATURES.products) {
    notFound();
  }

  return <ProductsView />;
}
