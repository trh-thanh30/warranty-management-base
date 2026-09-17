import { PUBLIC_FEATURES } from "@/src/config/public-features.config";
import { createGeneratePageMetadata } from "@/src/config/seo.config";
import { WarrantyActivateView } from "@/src/views/warranty/activate.view";
import { notFound } from "next/navigation";

export const generateMetadata =
  createGeneratePageMetadata("/warranty/activate");

export default function WarrantyActivatePage() {
  if (!PUBLIC_FEATURES.pages.warrantyActivation) {
    notFound();
  }

  return <WarrantyActivateView />;
}
