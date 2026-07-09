"use client";

import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useCustomer } from "./use-customers";

type CustomerDetailOptions =
  | {
      customerId?: never;
      mode: "create";
    }
  | {
      customerId: string;
      mode: "edit";
    };

export function useCustomerDetail({ customerId, mode }: CustomerDetailOptions) {
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  const isEditing = mode === "edit";
  const editCustomerId = isEditing ? customerId : null;
  const canLoadCustomerDetail =
    Boolean(currentUser) && hasPermission(PERMISSIONS.CUSTOMER_UPDATE);

  const customerQuery = useCustomer(editCustomerId, {
    enabled: canLoadCustomerDetail && editCustomerId !== null,
  });

  return {
    customer: isEditing ? (customerQuery.data ?? null) : null,
    customerQuery,
    isEditing,
  };
}
