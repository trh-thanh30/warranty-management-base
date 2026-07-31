import { PUBLIC_FEATURES } from "@/src/config/public-features.config";
import { WarrantyActivateView } from "@/src/views/warranty/activate.view";
import { notFound } from "next/navigation";

export default function WarrantyActivatePage() {
  if (!PUBLIC_FEATURES.warrantyActivation) {
    notFound();
  }

  return <WarrantyActivateView />;
}
