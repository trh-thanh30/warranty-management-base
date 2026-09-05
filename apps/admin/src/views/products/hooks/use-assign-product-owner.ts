"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ProductResponse } from "@repo/shared";
import { HttpClientError } from "@repo/shared";
import { useToast } from "@/src/hooks/use-toast";
import { toOptionalValue } from "@/src/utils";
import { useInfiniteCustomers } from "../../customers/hooks/use-customers";
import { assignProductOwnerSchema } from "../products.types";
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
  const customersQuery = useInfiniteCustomers(
    {
      limit: 50,
      sortBy: "createdAt",
    },
    { enabled },
  );
  const assignOwner = useAssignProductOwner(product?.id ?? null);

  function reset() {
    setCustomerId("");
    setPurchaseDate("");
  }

  async function confirm() {
    const result = assignProductOwnerSchema.safeParse({
      customerId,
      purchaseDate,
    });
    if (!result.success) {
      toast.error(t(result.error.issues[0]?.message ?? "assignOwnerError"));
      return;
    }

    try {
      await assignOwner.mutateAsync({
        customerId: result.data.customerId,
        purchaseDate: toOptionalValue(result.data.purchaseDate),
      });
      toast.success(t("ownerAssigned"));
      reset();
      onAssigned?.();
    } catch (error) {
      const message =
        error instanceof HttpClientError
          ? getAssignOwnerErrorMessage(error.message, t)
          : t("assignOwnerError");
      toast.error(message);
    }
  }

  return {
    confirm,
    customerId,
    customersQuery,
    isAssigning: assignOwner.isPending,
    purchaseDate,
    reset,
    setCustomerId,
    setPurchaseDate,
  };
}

function getAssignOwnerErrorMessage(
  message: string,
  t: (key: string) => string,
) {
  const translationKeys: Record<string, string> = {
    "Customer not found": "customerNotFound",
    "Warranty not found": "warrantyNotFound",
  };

  const translationKey = translationKeys[message];
  return translationKey ? t(translationKey) : message;
}
