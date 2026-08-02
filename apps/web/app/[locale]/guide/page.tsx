import { GuideView } from "@/src/views/guide/guide.view";
import { createGeneratePageMetadata } from "@/src/config/seo.config";

export const generateMetadata = createGeneratePageMetadata("/guide");

export default function GuidePage() {
  return <GuideView />;
}
