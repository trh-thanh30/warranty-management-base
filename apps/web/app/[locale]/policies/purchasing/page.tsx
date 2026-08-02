import { PurchasingPolicyView } from "@/src/views/policy/purchasing-policy.view";
import { createGeneratePageMetadata } from "@/src/config/seo.config";

export const generateMetadata = createGeneratePageMetadata(
  "/policies/purchasing",
);

export default function PurchasingPolicyPage() {
  return <PurchasingPolicyView />;
}
