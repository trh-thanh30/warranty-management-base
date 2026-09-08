"use client";

import { ActivationCodeDetailView } from "./activation-code-detail.view";

export function ProductActivationCodesView({
  productId,
}: {
  productId: string;
}) {
  return <ActivationCodeDetailView productId={productId} />;
}
