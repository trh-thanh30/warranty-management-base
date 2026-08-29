"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@repo/hooks";
import type {
  CategoryResponse,
  ListProductsQuery,
  ProductResponse,
  ProductSortBy,
} from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useExcel } from "@/src/hooks/use-excel";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useToast } from "@/src/hooks/use-toast";
import { productsService } from "@/src/services/products/products.service";
import type {
  ProductImportRowData,
  ProductImportRowError,
} from "@/src/services/products/products.types";
import type { ExcelImportMode } from "@/src/components/common/excel-import-dialog";
import { useCategories } from "../../categories/hooks/use-categories";
import type { EditableProductImportRow } from "../components/product-import-preview-table";
import { type ProductStatusFilter } from "../products.types";
import {
  useConfirmProductImport,
  useDeleteProduct,
  useRestoreProduct,
  usePreviewProductImport,
  useProducts,
} from "./use-products";

const PRODUCTS_PAGE_SIZE = 10;

type ProductDirectoryFilters = {
  categoryId: string;
  status: ProductStatusFilter;
};

const INITIAL_PRODUCT_DIRECTORY_FILTERS = {
  categoryId: "ALL",
  status: "ACTIVE",
} satisfies ProductDirectoryFilters;

export function useProductsDirectory() {
  const t = useTranslations("Products");
  const toast = useToast();
  const { createDatedFilename, downloadBlob } = useExcel();
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  const {
    filterHandlers,
    filters,
    page,
    pageSize,
    search,
    setFilters,
    setPage,
    setPageSize,
    setSearch,
    sortBy,
    sortOrder,
    toggleSort,
  } = useTableControls<ProductDirectoryFilters, ProductSortBy>({
    initialFilters: INITIAL_PRODUCT_DIRECTORY_FILTERS,
    initialPageSize: PRODUCTS_PAGE_SIZE,
    initialSortBy: "createdAt",
    initialSortOrder: "desc",
  });
  const [productToDelete, setProductToDelete] =
    useState<ProductResponse | null>(null);
  const [productToRestore, setProductToRestore] =
    useState<ProductResponse | null>(null);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [importMode, setImportMode] = useState<ExcelImportMode>("upsert");
  const [importRows, setImportRows] = useState<EditableProductImportRow[]>([]);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const canViewProducts = hasPermission(PERMISSIONS.PRODUCT_VIEW);
  const canCreateProducts = hasPermission(PERMISSIONS.PRODUCT_CREATE);
  const productsQuery = useProducts(
    {
      categoryId: filters.categoryId === "ALL" ? undefined : filters.categoryId,
      limit: pageSize,
      page,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      status: filters.status === "ALL" ? "ALL" : filters.status,
    },
    {
      enabled: Boolean(currentUser) && canViewProducts,
    },
  );
  const categoriesQuery = useCategories(
    {
      isActive: "true",
      limit: 100,
      sortBy: "order",
      sortOrder: "asc",
      type: "PRODUCT",
    },
    { enabled: Boolean(currentUser) && canViewProducts },
  );
  const deleteProduct = useDeleteProduct();
  const restoreProduct = useRestoreProduct();
  const previewProductImport = usePreviewProductImport();
  const confirmProductImport = useConfirmProductImport();

  function clearFilters() {
    setSearch("");
    setFilters(INITIAL_PRODUCT_DIRECTORY_FILTERS);
    setPage(1);
  }

  function openDelete(product: ProductResponse) {
    setProductToDelete(product);
  }

  function closeDelete() {
    setProductToDelete(null);
  }

  function openRestore(product: ProductResponse) {
    setProductToRestore(product);
  }

  function closeRestore() {
    setProductToRestore(null);
  }

  async function confirmDelete() {
    if (!productToDelete) return;

    try {
      await deleteProduct.mutateAsync(productToDelete.id);
      toast.success(t("deleted"));
      closeDelete();
    } catch {
      toast.error(t("deleteError"));
    }
  }

  async function confirmRestore() {
    if (!productToRestore) return;

    try {
      await restoreProduct.mutateAsync(productToRestore.id);
      toast.success(t("restored"));
      closeRestore();
    } catch {
      toast.error(t("restoreError"));
    }
  }

  async function downloadImportTemplate() {
    try {
      const blob = await productsService.downloadImportTemplate();
      downloadBlob(blob, "product-import-template.xlsx");
      toast.success(t("excel.templateDownloaded"));
    } catch {
      toast.error(t("excel.templateDownloadError"));
    }
  }

  async function exportProducts() {
    try {
      const blob = await productsService.exportProducts(getExportQuery());
      downloadBlob(blob, createDatedFilename("products"));
      toast.success(t("excel.exported"));
    } catch {
      toast.error(t("excel.exportError"));
    }
  }

  async function previewImport(file: File, mode: ExcelImportMode) {
    try {
      const result = await previewProductImport.mutateAsync(file);
      setImportMode(mode);
      setImportRows(
        validateImportRows(
          result.rows.map((row, index) =>
            normalizePreviewRow({
              data: row.data,
              errors: row.errors,
              id: `${row.rowNumber}-${index}`,
              rowNumber: row.rowNumber,
            }),
          ),
        ),
      );
      const message =
        result.invalidRows > 0
          ? t("excel.importPreviewHasErrors", {
              invalid: result.invalidRows,
              total: result.totalRows,
              valid: result.validRows,
            })
          : t("excel.importPreviewSuccess", {
              total: result.totalRows,
              valid: result.validRows,
            });

      if (result.invalidRows > 0 || mode === "replace") {
        toast.info(message);
      } else {
        toast.success(message);
      }
    } catch {
      toast.error(t("excel.importPreviewError"));
    }
  }

  function updateImportRowData(rowId: string, data: ProductImportRowData) {
    setImportRows((currentRows) =>
      validateImportRows(
        currentRows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                data,
                errors: row.errors.filter(
                  (error) =>
                    !hasImportFieldChanged(row.data, data, error.field),
                ),
              }
            : row,
        ),
      ),
    );
  }

  function removeImportRow(rowId: string) {
    setImportRows((currentRows) =>
      validateImportRows(currentRows.filter((row) => row.id !== rowId)),
    );
  }

  function resetImportPreview() {
    setImportRows([]);
    setImportMode("upsert");
  }

  async function confirmImport() {
    const validatedRows = validateImportRows(importRows);
    setImportRows(validatedRows);

    if (validatedRows.some((row) => row.errors.length > 0)) {
      toast.error(t("excel.fixErrorsBeforeImport"));
      return;
    }

    try {
      const result = await confirmProductImport.mutateAsync({
        mode: importMode,
        rows: validatedRows.map((row) => row.data),
      });

      if (result.errors.length > 0) {
        setImportRows((currentRows) =>
          currentRows.map((row, index) => ({
            ...row,
            errors: result.errors.filter(
              (error) => error.rowNumber === index + 1,
            ),
          })),
        );
        toast.error(t("excel.confirmHasErrors"));
        return;
      }

      toast.success(
        t("excel.confirmSuccess", {
          created: result.created,
          deactivated: result.deactivated,
          updated: result.updated,
        }),
      );
      resetImportPreview();
      setImportDialogOpen(false);
      void productsQuery.refetch();
    } catch {
      toast.error(t("excel.confirmError"));
    }
  }

  function getExportQuery(): ListProductsQuery {
    return {
      categoryId: filters.categoryId === "ALL" ? undefined : filters.categoryId,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      status: filters.status === "ALL" ? "ALL" : filters.status,
    };
  }

  return {
    canCreateProducts,
    categories: categoriesQuery.data?.items ?? ([] as CategoryResponse[]),
    categoriesQuery,
    clearFilters,
    closeDelete,
    confirmDelete,
    filters,
    isDeleting: deleteProduct.isPending,
    isRestoring: restoreProduct.isPending,
    isImportDialogOpen,
    importMode,
    importRows,
    importSummary: getImportSummary(importRows),
    isImportConfirming: confirmProductImport.isPending,
    isImportPreviewing: previewProductImport.isPending,
    openDelete,
    openRestore,
    openImportDialog: () => setImportDialogOpen(true),
    pageSize,
    productToDelete,
    productToRestore,
    productsQuery,
    search,
    closeRestore,
    confirmRestore,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    closeImportDialog: () => {
      setImportDialogOpen(false);
      resetImportPreview();
    },
    confirmImport,
    downloadImportTemplate,
    exportProducts,
    previewImport,
    removeImportRow,
    resetImportPreview,
    toggleSort,
    updateCategoryId: filterHandlers.categoryId,
    updateSearch: setSearch,
    updateStatus: filterHandlers.status,
    updateImportRowData,
  };
}

function normalizePreviewRow(row: {
  data: Partial<ProductImportRowData>;
  errors: ProductImportRowError[];
  id: string;
  rowNumber: number;
}): EditableProductImportRow {
  const normalizedRow: EditableProductImportRow = {
    ...row,
    data: {
      displayName: row.data.displayName ?? "",
      categoryCode: row.data.categoryCode ?? "",
      brand: row.data.brand ?? null,
      model: row.data.model ?? null,
      modelYear: row.data.modelYear ?? null,
      shortDescription: row.data.shortDescription ?? null,
      description: row.data.description ?? null,
      warrantyDurationMonths: row.data.warrantyDurationMonths ?? 0,
      warrantyTerms: row.data.warrantyTerms ?? null,
      installationPosition: row.data.installationPosition ?? null,
      productCode: row.data.productCode ?? null,
      serialNumber: row.data.serialNumber ?? null,
      status: row.data.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      warrantyCode: row.data.warrantyCode ?? null,
    },
  };

  return normalizedRow;
}

function validateImportRows(rows: EditableProductImportRow[]) {
  const productCodeCounts = new Map<string, number>();
  const serialNumberCounts = new Map<string, number>();
  const warrantyCodeCounts = new Map<string, number>();

  rows.forEach((row) => {
    const productCode = row.data.productCode?.trim();
    const serialNumber = row.data.serialNumber?.trim();
    const warrantyCode = row.data.warrantyCode?.trim().toUpperCase();

    if (productCode) {
      productCodeCounts.set(
        productCode,
        (productCodeCounts.get(productCode) ?? 0) + 1,
      );
    }

    if (serialNumber) {
      serialNumberCounts.set(
        serialNumber,
        (serialNumberCounts.get(serialNumber) ?? 0) + 1,
      );
    }

    if (warrantyCode) {
      warrantyCodeCounts.set(
        warrantyCode,
        (warrantyCodeCounts.get(warrantyCode) ?? 0) + 1,
      );
    }
  });

  return rows.map((row) => {
    const errors = row.errors.filter(
      (error) => !isRecomputedImportError(error),
    );
    const productCode = row.data.productCode?.trim();
    const serialNumber = row.data.serialNumber?.trim();
    const warrantyCode = row.data.warrantyCode?.trim().toUpperCase();
    if (!row.data.displayName.trim()) {
      errors.push({
        field: "displayName",
        message: "Tên sản phẩm là bắt buộc.",
        rowNumber: row.rowNumber,
      });
    }
    if (!row.data.categoryCode.trim()) {
      errors.push({
        field: "categoryCode",
        message: "Mã danh mục là bắt buộc.",
        rowNumber: row.rowNumber,
      });
    }
    if (row.data.warrantyDurationMonths < 1) {
      errors.push({
        field: "warrantyDurationMonths",
        message: "Thời hạn bảo hành phải từ 1 tháng.",
        rowNumber: row.rowNumber,
      });
    }

    if (!["ACTIVE", "INACTIVE"].includes(row.data.status)) {
      errors.push({
        field: "status",
        message: "Chọn trạng thái sản phẩm hợp lệ.",
        rowNumber: row.rowNumber,
      });
    }

    if (productCode && (productCodeCounts.get(productCode) ?? 0) > 1) {
      errors.push({
        field: "productCode",
        message: "Mã sản phẩm bị trùng trong bảng preview.",
        rowNumber: row.rowNumber,
      });
    }

    if (serialNumber && (serialNumberCounts.get(serialNumber) ?? 0) > 1) {
      errors.push({
        field: "serialNumber",
        message: "Số serial bị trùng trong bảng preview.",
        rowNumber: row.rowNumber,
      });
    }

    if (warrantyCode && !/^[A-Z0-9-]{6,64}$/.test(warrantyCode)) {
      errors.push({
        field: "warrantyCode",
        message: "Mã bảo hành chỉ gồm 6-64 chữ cái, số hoặc dấu gạch ngang.",
        rowNumber: row.rowNumber,
      });
    } else if (
      warrantyCode &&
      (warrantyCodeCounts.get(warrantyCode) ?? 0) > 1
    ) {
      errors.push({
        field: "warrantyCode",
        message: "Mã bảo hành bị trùng trong bảng preview.",
        rowNumber: row.rowNumber,
      });
    }

    return {
      ...row,
      errors: dedupeImportErrors(errors),
    };
  });
}

const RECOMPUTED_IMPORT_ERROR_MESSAGES = new Set([
  "Tên sản phẩm là bắt buộc",
  "Tên sản phẩm là bắt buộc.",
  "Mã danh mục là bắt buộc",
  "Mã danh mục là bắt buộc.",
  "Thời hạn bảo hành phải từ 1 tháng.",
  "Mã sản phẩm bị trùng trong file import",
  "Mã sản phẩm bị trùng trong bảng preview.",
  "Số serial bị trùng trong file import",
  "Số serial bị trùng trong bảng preview.",
  "Mã bảo hành bị trùng trong file import",
  "Mã bảo hành bị trùng trong bảng preview.",
  "Mã bảo hành chỉ gồm 6-64 chữ cái, số hoặc dấu gạch ngang.",
]);

function isRecomputedImportError(error: ProductImportRowError) {
  return RECOMPUTED_IMPORT_ERROR_MESSAGES.has(error.message);
}

function hasImportFieldChanged(
  currentData: ProductImportRowData,
  nextData: ProductImportRowData,
  field: string,
) {
  if (!(field in currentData) || !(field in nextData)) return false;

  const key = field as keyof ProductImportRowData;
  return currentData[key] !== nextData[key];
}

function dedupeImportErrors(errors: ProductImportRowError[]) {
  const seen = new Set<string>();
  return errors.filter((error) => {
    const key = `${error.rowNumber}:${error.field}:${error.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getImportSummary(rows: EditableProductImportRow[]) {
  const invalidRows = rows.filter((row) => row.errors.length > 0).length;

  return {
    invalidRows,
    totalRows: rows.length,
    validRows: rows.length - invalidRows,
  };
}
