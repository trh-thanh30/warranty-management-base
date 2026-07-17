"use client";

import { useState } from "react";
import { useDebounce } from "@repo/hooks";
import type { ContentPageSortBy, ContentPageSummary } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { CONTENT_PAGES_PAGE_SIZE } from "../content-pages.constants";
import type {
  ContentPageKindFilter,
  ContentPageStatusFilter,
} from "../content-pages.types";
import { useContentPages, useDeleteContentPage } from "./use-content-pages";

type Filters = { kind: ContentPageKindFilter; status: ContentPageStatusFilter };

export function useContentPagesDirectory() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const controls = useTableControls<Filters, ContentPageSortBy>({
    initialFilters: { kind: "ALL", status: "ALL" },
    initialPageSize: CONTENT_PAGES_PAGE_SIZE,
    initialSortBy: "updatedAt",
    initialSortOrder: "desc",
  });
  const [pageToDelete, setPageToDelete] = useState<ContentPageSummary | null>(
    null,
  );
  const removePage = useDeleteContentPage();
  const debouncedSearch = useDebounce(controls.search.trim(), 300);
  const canView = hasPermission(PERMISSIONS.CONTENT_PAGE_VIEW);
  const query = useContentPages(
    {
      page: controls.page,
      limit: controls.pageSize,
      search: debouncedSearch || undefined,
      kind: controls.filters.kind === "ALL" ? undefined : controls.filters.kind,
      status:
        controls.filters.status === "ALL" ? undefined : controls.filters.status,
      sortBy: controls.sortBy,
      sortOrder: controls.sortOrder,
    },
    { enabled: Boolean(user) && canView },
  );

  return {
    ...controls,
    canCreate: hasPermission(PERMISSIONS.CONTENT_PAGE_CREATE),
    canDelete: hasPermission(PERMISSIONS.CONTENT_PAGE_DELETE),
    canEdit: hasPermission(PERMISSIONS.CONTENT_PAGE_UPDATE),
    deletePage: async () => {
      if (!pageToDelete) return;
      await removePage.mutateAsync(pageToDelete.id);
      setPageToDelete(null);
    },
    isDeleting: removePage.isPending,
    kind: controls.filters.kind,
    openDelete: setPageToDelete,
    pageToDelete,
    query,
    setKind: controls.filterHandlers.kind,
    setStatus: controls.filterHandlers.status,
    status: controls.filters.status,
  };
}
