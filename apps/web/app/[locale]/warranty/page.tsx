import { WarrantyHubView } from "@/src/views/warranty/warranty-hub.view";
import { createGeneratePageMetadata } from "@/src/config/seo.config";

export const generateMetadata = createGeneratePageMetadata("/warranty");

export default function WarrantyHubPage() {
  return <WarrantyHubView />;
}
