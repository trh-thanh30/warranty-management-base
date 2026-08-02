import { SupportCentersView } from "@/src/views/support-centers/support-centers.view";
import { createGeneratePageMetadata } from "@/src/config/seo.config";

export const generateMetadata = createGeneratePageMetadata("/support-centers");

export default function SupportCentersPage() {
  return <SupportCentersView />;
}
