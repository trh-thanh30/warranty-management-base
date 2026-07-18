"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ProductResponse } from "@repo/shared";
import { HttpClientError } from "@repo/shared";
import { useToast } from "@/src/hooks/use-toast";
import { toOptionalValue } from "@/src/utils";
import { useCustomers } from "../../customers/hooks/use-customers";
import { useAssignProductOwner } from "./use-products";

export function useAssignProductOwnerWorkflow({
  enabled,
  onAssigned,
  product,
}: {
  enabled: boolean;
  onAssigned?: () => void;
  product: ProductResponse | null;
}) {
  const t = useTranslations("Products");
  const toast = useToast();
  const [customerId, setCustomerId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [activatedAt, setActivatedAt] = useState("");
  const customersQuery = useCustomers(
    {
      limit: 50,
      sortBy: "createdAt",
    },
    { enabled },
  );
  const assignOwner = useAssignProductOwner(product?.id ?? null);

  function close() {
    setCustomerId("");
    setPurchaseDate("");
    setActivatedAt("");
  }

  async function confirm() {
    if (!customerId) {
      toast.error(t("customerRequired"));
      return;
    }

    try {
      await assignOwner.mutateAsync({
        activatedAt: toOptionalValue(activatedAt),
        customerId,
        purchaseDate: toOptionalValue(purchaseDate),
      });
      toast.success(t("ownerAssigned"));
      close();
      onAssigned?.();
    } catch (error) {
      const message =
        error instanceof HttpClientError
          ? error.message
          : t("assignOwnerError");
      toast.error(message);
    }
  }

  return {
    activatedAt,
    confirm,
    customerId,
    customersQuery,
    isAssigning: assignOwner.isPending,
    purchaseDate,
    setActivatedAt,
    setCustomerId,
    setPurchaseDate,
  };
}
