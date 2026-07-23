"use client";

import { useMemo, useState } from "react";
import { Edit3, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@repo/ui";
import { PaginationControls } from "@/src/components/common/pagination-controls";
import type {
  ProductImportRowData,
  ProductImportRowError,
} from "@/src/services/products/products.types";
import { ProductForm } from "./product-form";

export type EditableProductImportRow = {
  data: ProductImportRowData;
  errors: ProductImportRowError[];
  id: string;
  rowNumber: number;
};

type ImportPreviewFilter = "all" | "valid" | "invalid";

type ProductImportPreviewTableProps = {
  labels: {
    actions: string;
    allRows: string;
    brand: string;
    cancel: string;
    category: string;
    dynamicCategory: string;
    description: string;
    edit: string;
    editDescription: string;
    editTitle: string;
    imageUrl: string;
    importStatus: string;
    installationPosition: string;
    invalidRows: string;
    manufactureYear: string;
    model: string;
    name: string;
    next: string;
    noRows: string;
    pageSize: string;
    pagination: (values: {
      page: number;
      total: number;
      totalPages: number;
    }) => string;
    previous: string;
    productCode: string;
    ready: string;
    remove: string;
    row: string;
    saveChanges: string;
    serialNumber: string;
    status: string;
    validRows: string;
    warrantyDurationMonths: string;
    warrantyTerms: string;
    withErrors: string;
  };
  onEdit: (rowId: string, data: ProductImportRowData) => void;
  onRemove: (rowId: string) => void;
  rows: EditableProductImportRow[];
};

const INITIAL_IMPORT_PREVIEW_PAGE_SIZE = 10;

export function ProductImportPreviewTable({
  labels,
  onEdit,
  onRemove,
  rows,
}: ProductImportPreviewTableProps) {
  const [filter, setFilter] = useState<ImportPreviewFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(INITIAL_IMPORT_PREVIEW_PAGE_SIZE);
  const [editingRow, setEditingRow] = useState<EditableProductImportRow | null>(
    null,
  );
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (filter === "valid") return row.errors.length === 0;
        if (filter === "invalid") return row.errors.length > 0;
        return true;
      }),
    [filter, rows],
  );
  const totalPages = Math.max(Math.ceil(filteredRows.length / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function updateFilter(nextFilter: string) {
    setFilter(nextFilter as ImportPreviewFilter);
    setPage(1);
  }

  function removeRow(rowId: string) {
    onRemove(rowId);
    if (pagedRows.length === 1 && safePage > 1) {
      setPage(safePage - 1);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <Tabs onValueChange={updateFilter} value={filter}>
          <TabsList className="grid h-auto w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="all">{labels.allRows}</TabsTrigger>
            <TabsTrigger value="valid">{labels.validRows}</TabsTrigger>
            <TabsTrigger value="invalid">{labels.invalidRows}</TabsTrigger>
          </TabsList>
        </Tabs>
        <span className="text-xs text-slate-500">
          {labels.pagination({
            page: safePage,
            total: filteredRows.length,
            totalPages,
          })}
        </span>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200">
        <div className="max-h-[27rem] overflow-auto">
          <Table className="min-w-[90rem] whitespace-nowrap">
            <TableHeader className="sticky top-0 z-10 bg-slate-50">
              <TableRow>
                <TableHead className="w-20 whitespace-nowrap">
                  {labels.row}
                </TableHead>
                <TableHead className="w-40 whitespace-nowrap">
                  {labels.productCode}
                </TableHead>
                <TableHead className="w-56 whitespace-nowrap">
                  {labels.name}
                </TableHead>
                <TableHead className="w-56 whitespace-nowrap">
                  {labels.imageUrl}
                </TableHead>
                <TableHead className="w-44 whitespace-nowrap">
                  {labels.installationPosition}
                </TableHead>
                <TableHead className="w-40 whitespace-nowrap">
                  {labels.category}
                </TableHead>
                <TableHead className="w-44 whitespace-nowrap">
                  {labels.serialNumber}
                </TableHead>
                <TableHead className="w-40 whitespace-nowrap">
                  {labels.status}
                </TableHead>
                <TableHead className="w-40 whitespace-nowrap">
                  {labels.warrantyDurationMonths}
                </TableHead>
                <TableHead className="w-[32rem] whitespace-nowrap">
                  {labels.importStatus}
                </TableHead>
                <TableHead className="w-28 whitespace-nowrap text-right">
                  {labels.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRows.length > 0 ? (
                pagedRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">
                      <span className="text-xs font-medium text-slate-500">
                        #{row.rowNumber}
                      </span>
                    </TableCell>
                    <PreviewCell value={row.data.productCode} />
                    <PreviewCell value={row.data.name} />
                    <PreviewCell value={row.data.imageUrl} />
                    <PreviewCell value={row.data.installationPosition} />
                    <PreviewCell value={row.data.category} />
                    <PreviewCell value={row.data.serialNumber} />
                    <PreviewCell value={row.data.status} />
                    <PreviewCell value={row.data.warrantyDurationMonths} />
                    <TableCell className="w-[32rem] max-w-[32rem] whitespace-normal">
                      <ImportRowStatus
                        errors={row.errors}
                        readyLabel={labels.ready}
                        withErrorsLabel={labels.withErrors}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          aria-label={labels.edit}
                          onClick={() => setEditingRow(row)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Edit3 className="size-4" />
                        </Button>
                        <Button
                          aria-label={labels.remove}
                          onClick={() => removeRow(row.id)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-sm text-slate-500"
                    colSpan={11}
                  >
                    {labels.noRows}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <PaginationControls
        nextLabel={labels.next}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
        page={safePage}
        pageSize={pageSize}
        pageSizeLabel={labels.pageSize}
        pageSizeOptions={[5, 10, 20, 50]}
        previousLabel={labels.previous}
        summary={labels.pagination({
          page: safePage,
          total: filteredRows.length,
          totalPages,
        })}
        totalPages={totalPages}
      />

      <ProductImportEditDialog
        labels={labels}
        onOpenChange={(open) => {
          if (!open) setEditingRow(null);
        }}
        onSave={(data) => {
          if (!editingRow) return;
          onEdit(editingRow.id, data);
          setEditingRow(null);
        }}
        open={Boolean(editingRow)}
        row={editingRow}
      />
    </div>
  );
}

function ProductImportEditDialog({
  labels,
  onOpenChange,
  onSave,
  open,
  row,
}: {
  labels: ProductImportPreviewTableProps["labels"];
  onOpenChange: (open: boolean) => void;
  onSave: (data: ProductImportRowData) => void;
  open: boolean;
  row: EditableProductImportRow | null;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[calc(100vh-3rem)] w-[min(calc(100vw-2rem),56rem)] overflow-y-auto p-6">
        <div className="space-y-1">
          <DialogTitle className="text-lg font-semibold text-slate-950">
            {labels.editTitle}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {labels.editDescription}
          </DialogDescription>
        </div>

        {row ? (
          <div className="mt-5">
            <ProductForm
              initialValues={row.data}
              key={row.id}
              mode="import-preview"
              onCancel={() => onOpenChange(false)}
              onSaved={onSave}
              submitLabel={labels.saveChanges}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function PreviewCell({ value }: { value: number | string | null }) {
  const displayValue = value ?? "-";

  return (
    <TableCell className="whitespace-nowrap">
      <span
        className="block max-w-56 truncate whitespace-nowrap text-sm text-slate-700"
        title={String(displayValue)}
      >
        {displayValue}
      </span>
    </TableCell>
  );
}

function ImportRowStatus({
  errors,
  readyLabel,
  withErrorsLabel,
}: {
  errors: ProductImportRowError[];
  readyLabel: string;
  withErrorsLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 whitespace-normal">
      <Badge
        className="shrink-0 whitespace-nowrap"
        variant={errors.length > 0 ? "destructive" : "success"}
      >
        {errors.length > 0 ? withErrorsLabel : readyLabel}
      </Badge>
      {errors.map((error, index) => {
        const message = error.field
          ? `${error.field}: ${error.message}`
          : error.message;

        return (
          <span
            className="inline-flex shrink-0 items-center gap-1"
            key={`${error.field}-${error.message}-${index}`}
          >
            <Badge
              className="whitespace-nowrap"
              title={message}
              variant="destructive"
            >
              {message}
            </Badge>
          </span>
        );
      })}
    </div>
  );
}
