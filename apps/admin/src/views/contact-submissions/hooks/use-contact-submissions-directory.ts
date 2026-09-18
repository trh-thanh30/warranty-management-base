"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@repo/hooks";
import type {
  ContactSubmissionResponse,
  ContactSubmissionStatus,
} from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import {
  useContactSubmissions,
  useUpdateContactSubmissionStatus,
} from "@/src/hooks/use-contact-submissions";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useExcel } from "@/src/hooks/use-excel";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useToast } from "@/src/hooks/use-toast";
import { contactSubmissionsService } from "@/src/services/contact-submissions/contact-submissions.service";
import {
  CONTACT_SUBMISSIONS_PAGE_SIZE,
  type ContactSubmissionStatusFilter,
} from "../contact-submissions.constants";
import { toContactSubmissionStatusQuery } from "../contact-submissions.utils";

type ContactSubmissionDirectoryFilters = {
  status: ContactSubmissionStatusFilter;
};

const INITIAL_FILTERS = {
  status: "ALL",
} satisfies ContactSubmissionDirectoryFilters;

export function useContactSubmissionsDirectory() {
  const t = useTranslations("ContactSubmissions");
  const toast = useToast();
  const { createDatedFilename, downloadBlob } = useExcel();
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const {
    filterHandlers,
    filters,
    page,
    pageSize,
    resetControls,
    search,
    setPage,
    setPageSize,
    setSearch,
  } = useTableControls<ContactSubmissionDirectoryFilters>({
    initialFilters: INITIAL_FILTERS,
    initialPageSize: CONTACT_SUBMISSIONS_PAGE_SIZE,
  });
  const debouncedSearch = useDebounce(search.trim(), 300);
  const canView = hasPermission(PERMISSIONS.CONTACT_SUBMISSION_VIEW);
  const canUpdate = hasPermission(PERMISSIONS.CONTACT_SUBMISSION_UPDATE);
  const submissionsQuery = useContactSubmissions(
    {
      limit: pageSize,
      page,
      search: debouncedSearch || undefined,
      status: toContactSubmissionStatusQuery(filters.status),
    },
    { enabled: Boolean(user) && canView },
  );
  const updateStatus = useUpdateContactSubmissionStatus();

  async function exportSubmissions() {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const blob = await contactSubmissionsService.exportContactSubmissions({
        search: search.trim() || undefined,
        status: toContactSubmissionStatusQuery(filters.status),
      });
      downloadBlob(blob, createDatedFilename("contact-submissions"));
      toast.success(t("toasts.exportSuccess"));
    } catch {
      toast.error(t("toasts.exportError"));
    } finally {
      setIsExporting(false);
    }
  }

  async function updateSubmissionStatus(
    submission: ContactSubmissionResponse,
    status: ContactSubmissionStatus,
  ) {
    if (submission.status === status) return;

    try {
      await updateStatus.mutateAsync({
        id: submission.id,
        status,
      });
      toast.success(t("toasts.updateSuccess"));
    } catch {
      toast.error(t("toasts.updateError"));
    }
  }

  return {
    canUpdate,
    clearFilters: resetControls,
    exportSubmissions,
    isExporting,
    isUpdating: updateStatus.isPending,
    pageSize,
    search,
    setPage,
    setPageSize,
    status: filters.status,
    submissionsQuery,
    updateSearch: setSearch,
    updateStatus: filterHandlers.status,
    updateSubmissionStatus,
  };
}
