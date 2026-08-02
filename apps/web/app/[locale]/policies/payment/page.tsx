import { PaymentPolicyView } from "@/src/views/policy/payment-policy.view";
import { createGeneratePageMetadata } from "@/src/config/seo.config";

export const generateMetadata = createGeneratePageMetadata("/policies/payment");

export default function PaymentPolicyPage() {
  return <PaymentPolicyView />;
}
