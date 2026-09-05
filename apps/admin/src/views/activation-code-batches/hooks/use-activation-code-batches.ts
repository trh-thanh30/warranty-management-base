"use client";

import { useDebounce } from "@repo/hooks";
import type { ActivationCodeReportStatus } from "@repo/shared";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PERMISSIONS } from "@repo/shared/constants";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import { useState } from "react";

export function useActivationCodeBatches() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const canView = hasPermission(PERMISSIONS.ACTIVATION_CODE_BATCH_VIEW);
  const canCreate = hasPermission(PERMISSIONS.ACTIVATION_CODE_BATCH_CREATE);
  const canRevoke = hasPermission(PERMISSIONS.ACTIVATION_CODE_BATCH_REVOKE);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ActivationCodeReportStatus | "">("");
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [quantity, setQuantity] = useState("50");
  const queryClient = useQueryClient();
  const debouncedSearch = useDebounce(search.trim(), 300);
  const query = useQuery({
    enabled: Boolean(user) && canView,
    queryFn: () =>
      activationCodesService.listBatches({
        limit: 20,
        page,
        search: debouncedSearch || undefined,
        status: status || undefined,
      }),
    queryKey: ["activation-code-batches", { debouncedSearch, page, status }],
  });
  const createMutation = useMutation({
    mutationFn: () =>
      activationCodesService.createBatch({
        batchName: batchName.trim() || undefined,
        quantity: Number(quantity),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["activation-code-batches"],
      });
      setCreateOpen(false);
      setBatchName("");
      setQuantity("50");
    },
  });
  const revokeMutation = useMutation({
    mutationFn: (batchId: string) =>
      activationCodesService.revokeBatch(batchId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["activation-code-batches"],
      });
    },
  });

  return {
    canView,
    canCreate,
    canRevoke,
    batchName,
    createMutation,
    isCreateOpen,
    page,
    query,
    search,
    quantity,
    revokeMutation,
    setCreateOpen,
    setBatchName,
    setPage,
    setSearch: (value: string) => {
      setPage(1);
      setSearch(value);
    },
    setQuantity,
    setStatus: (value: ActivationCodeReportStatus | "") => {
      setPage(1);
      setStatus(value);
    },
    status,
  };
}
