import { WarrantyTrackView } from "@/src/views/warranty/track.view";
import { createGeneratePageMetadata } from "@/src/config/seo.config";

export const generateMetadata = createGeneratePageMetadata("/warranty/track");

export default function WarrantyTrackPage() {
  return <WarrantyTrackView />;
}
