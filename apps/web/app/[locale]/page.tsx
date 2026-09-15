import { WarrantyRootRedirectView } from "@/src/views/warranty/warranty-root-redirect.view";

export default function Page(
  props: Parameters<typeof WarrantyRootRedirectView>[0],
) {
  return <WarrantyRootRedirectView {...props} />;
}
