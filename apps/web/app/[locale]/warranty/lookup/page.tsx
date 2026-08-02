import { WarrantyLookupView } from "@/src/views/warranty/lookup.view";
import { createGeneratePageMetadata } from "@/src/config/seo.config";

export const generateMetadata = createGeneratePageMetadata("/warranty/lookup");

export default function WarrantyLookupPage() {
  return <WarrantyLookupView />;
}
