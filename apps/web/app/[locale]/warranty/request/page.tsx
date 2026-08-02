import { WarrantyClaimRequestView } from "@/src/views/warranty/request.view";
import { createGeneratePageMetadata } from "@/src/config/seo.config";

export const generateMetadata = createGeneratePageMetadata("/warranty/request");

export default function WarrantyClaimRequestPage() {
  return <WarrantyClaimRequestView />;
}
