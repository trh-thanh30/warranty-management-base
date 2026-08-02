import { PolicyView } from "@/src/views/policy/policy.view";
import { createGeneratePageMetadata } from "@/src/config/seo.config";

export const generateMetadata = createGeneratePageMetadata("/policies");

export default function PoliciesPage() {
  return <PolicyView />;
}
