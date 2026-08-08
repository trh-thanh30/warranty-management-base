"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { type ProductResponse } from "@repo/shared";
import { useToast } from "@/src/hooks/use-toast";
import { getLocalizedApiError } from "@/src/lib/localized-api-error.utils";
import { productsService } from "@/src/services/products/products.service";
import { productKeys } from "../hooks/use-products";
import {
  ProductStatusControl,
  type ProductEditableStatus,
} from "./product-status-control";

export function ProductStatusToggle({ product }: { product: ProductResponse }) {
  const t = useTranslations("Products");
  const tApiErrors = useTranslations("ApiErrors");
  const toast = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ProductEditableStatus>(
    toEditableStatus(product.status),
  );
  const updateStatus = useMutation({
    mutationFn: (nextStatus: ProductEditableStatus) =>
      productsService.updateProduct(product.id, { status: nextStatus }),
    onError: (error) => {
      setStatus(toEditableStatus(product.status));
      const message = getLocalizedApiError(error, t, {
        apiErrors: tApiErrors,
        fallbackKey: "statusUpdateError",
      });
      toast.error(message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success(t("statusUpdated"));
    },
  });

  useEffect(() => {
    setStatus(toEditableStatus(product.status));
  }, [product.id, product.status]);

  return (
    <ProductStatusControl
      disabled={updateStatus.isPending}
      id="product-status-toggle"
      onStatusChange={(nextStatus) => {
        if (nextStatus === status) return;

        setStatus(nextStatus);
        updateStatus.mutate(nextStatus);
      }}
      status={status}
    />
  );
}

function toEditableStatus(
  status: ProductResponse["status"],
): ProductEditableStatus {
  return status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
}
