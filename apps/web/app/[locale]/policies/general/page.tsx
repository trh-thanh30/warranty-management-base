import { GeneralPolicyView } from "@/src/views/policy/general-policy.view";
import { createGeneratePageMetadata } from "@/src/config/seo.config";

export const generateMetadata = createGeneratePageMetadata("/policies/general");

export default function GeneralPolicyPage() {
  return <GeneralPolicyView />;
}
