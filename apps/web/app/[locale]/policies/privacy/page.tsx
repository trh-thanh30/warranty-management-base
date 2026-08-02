import { PrivacyPolicyView } from "@/src/views/policy/privacy-policy.view";
import { createGeneratePageMetadata } from "@/src/config/seo.config";

export const generateMetadata = createGeneratePageMetadata("/policies/privacy");

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}
