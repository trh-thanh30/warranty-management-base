import { DealersView } from "@/src/views/dealers/dealers.view";
import { createGeneratePageMetadata } from "@/src/config/seo.config";

export const generateMetadata = createGeneratePageMetadata("/dealers");

export default function DealersPage() {
  return <DealersView />;
}
