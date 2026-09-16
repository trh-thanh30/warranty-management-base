"use client";

import { useDebounce } from "@repo/hooks";
import type {
  ActivationCodeBatchRevokeScope,
  ActivationCodeReportStatus,
} from "@repo/shared";
import { useAuth } from "@/src/app/providers/auth-provider";
import { useExcel } from "@/src/hooks/use-excel";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useToast } from "@/src/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PERMISSIONS } from "@repo/shared/constants";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function useActivationCodeBatches() {
  const t = useTranslations("ActivationCodeBatches");
  const toast = useToast();
  const { createDatedFilename, downloadBlob } = useExcel();
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
  const [quantity, setQuantity] = useState("");
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
        quantity: quantity.trim() ? Number(quantity) : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["activation-code-batches"],
      });
      setCreateOpen(false);
      setBatchName("");
      setQuantity("");
    },
  });
  const revokeMutation = useMutation({
    mutationFn: ({
      batchId,
      scope,
    }: {
      batchId: string;
      scope: ActivationCodeBatchRevokeScope;
    }) => activationCodesService.revokeBatch(batchId, { scope }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["activation-code-batches"],
      });
    },
  });
  const exportMutation = useMutation({
    mutationFn: () => activationCodesService.exportReport(),
    onSuccess: (blob) => {
      downloadBlob(blob, createDatedFilename("activation-code-report"));
      toast.success(t("excel.exported"));
    },
    onError: () => toast.error(t("excel.exportError")),
  });

  return {
    canView,
    canCreate,
    canRevoke,
    batchName,
    createMutation,
    exportMutation,
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
