import { WarrantyReturnPolicyView } from "@/src/views/policy/warranty-return-policy.view";
import { createGeneratePageMetadata } from "@/src/config/seo.config";

export const generateMetadata = createGeneratePageMetadata(
  "/policies/warranty-return",
);

export default function WarrantyReturnPolicyPage() {
  return <WarrantyReturnPolicyView />;
}
