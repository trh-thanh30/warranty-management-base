import { ShippingPolicyView } from "@/src/views/policy/shipping-policy.view";
import { createGeneratePageMetadata } from "@/src/config/seo.config";

export const generateMetadata =
  createGeneratePageMetadata("/policies/shipping");

export default function ShippingPolicyPage() {
  return <ShippingPolicyView />;
}
