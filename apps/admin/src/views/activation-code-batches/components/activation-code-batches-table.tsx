"use client";

import { ActivationCodeStatusBadge } from "@/src/components/activation-code-status-badge";
import { ConfirmActionDialog } from "@/src/components/common/confirm-action-dialog";
import type { ActivationCodeBatchListItem } from "@/src/services/activation-codes/activation-code-batches.types";
import { formatDate, type ActivationCodePrintJob } from "@repo/shared";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "@repo/ui";
import { Eye, MoreHorizontal, Pencil, Printer, ShieldOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { ACTIVATION_CODE_BATCH_STATUSES } from "../activation-code-batches.constants";
import { ActivationCodePrintDialog } from "./activation-code-print-dialog";

type ActivationCodeBatchesTableProps = {
  canPrint: boolean;
  canRevoke: boolean;
  items: ActivationCodeBatchListItem[];
  onJobRequested: (
    batch: ActivationCodeBatchListItem,
    job: ActivationCodePrintJob,
  ) => void;
  onRevoke: (batch: ActivationCodeBatchListItem) => void;
  onRename: (batch: ActivationCodeBatchListItem, name: string) => void;
};

export function ActivationCodeBatchesTable({
  canPrint,
  canRevoke,
  items,
  onJobRequested,
  onRevoke,
  onRename,
}: ActivationCodeBatchesTableProps) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((batch) => (
          <ActivationCodeBatchMobileCard
            batch={batch}
            canPrint={canPrint}
            canRevoke={canRevoke}
            key={batch.id}
            onJobRequested={onJobRequested}
            onRevoke={onRevoke}
            onRename={onRename}
          />
        ))}
      </div>

      <TableScroll className="hidden rounded-md border border-slate-200 dark:border-slate-800 md:block">
        <Table className="min-w-230 [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
          <TableHeader>
            <ActivationCodeBatchTableHeader />
          </TableHeader>
          <TableBody>
            {items.map((batch) => (
              <ActivationCodeBatchTableRow
                batch={batch}
                canPrint={canPrint}
                canRevoke={canRevoke}
                key={batch.id}
                onJobRequested={onJobRequested}
                onRevoke={onRevoke}
                onRename={onRename}
              />
            ))}
          </TableBody>
        </Table>
      </TableScroll>
    </>
  );
}

function ActivationCodeBatchTableHeader() {
  const t = useTranslations("ActivationCodeBatches");

  return (
    <TableRow>
      <TableHead>{t("columns.batch")}</TableHead>
      <TableHead>{t("columns.quantity")}</TableHead>
      <TableHead>{t("columns.assignment")}</TableHead>
      <TableHead>{t("columns.status")}</TableHead>
      <TableHead>{t("columns.createdAt")}</TableHead>
      <TableHead>{t("columns.expiresAt")}</TableHead>
      <TableHead aria-label={t("columns.actions")} className="w-12" />
    </TableRow>
  );
}

function ActivationCodeBatchTableRow({
  batch,
  canPrint,
  canRevoke,
  onJobRequested,
  onRevoke,
  onRename,
}: {
  batch: ActivationCodeBatchListItem;
  canPrint: boolean;
  canRevoke: boolean;
  onJobRequested: ActivationCodeBatchesTableProps["onJobRequested"];
  onRevoke: ActivationCodeBatchesTableProps["onRevoke"];
  onRename: ActivationCodeBatchesTableProps["onRename"];
}) {
  const locale = useLocale();

  return (
    <TableRow>
      <TableCell className="font-medium text-slate-950 dark:text-slate-50">
        <div>
          <p>{batch.batchName}</p>
          <p className="mt-0.5 text-xs font-normal text-slate-500 dark:text-slate-400">
            {batch.batchCode}
          </p>
        </div>
      </TableCell>
      <TableCell className="tabular-nums">{batch.quantity}</TableCell>
      <TableCell>
        <ActivationCodeAssignmentProgress batch={batch} />
      </TableCell>
      <TableCell>
        <ActivationCodeStatusCounts batch={batch} />
      </TableCell>
      <TableCell>{formatDate(batch.createdAt, { locale })}</TableCell>
      <TableCell>{formatDate(batch.expiresAt, { locale })}</TableCell>
      <TableCell className="text-right">
        <ActivationCodeBatchActionsMenu
          batch={batch}
          canPrint={canPrint}
          canRevoke={canRevoke}
          onJobRequested={onJobRequested}
          onRevoke={onRevoke}
          onRename={onRename}
        />
      </TableCell>
    </TableRow>
  );
}

function ActivationCodeBatchMobileCard({
  batch,
  canPrint,
  canRevoke,
  onJobRequested,
  onRevoke,
  onRename,
}: {
  batch: ActivationCodeBatchListItem;
  canPrint: boolean;
  canRevoke: boolean;
  onJobRequested: ActivationCodeBatchesTableProps["onJobRequested"];
  onRevoke: ActivationCodeBatchesTableProps["onRevoke"];
  onRename: ActivationCodeBatchesTableProps["onRename"];
}) {
  const locale = useLocale();
  const t = useTranslations("ActivationCodeBatches");

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-medium text-slate-950 dark:text-slate-50">
            <p className="truncate font-medium">{batch.batchName}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {batch.batchCode}
            </p>
          </div>
          <ProductSummary batch={batch} />
        </div>
        <ActivationCodeBatchActionsMenu
          batch={batch}
          canPrint={canPrint}
          canRevoke={canRevoke}
          onJobRequested={onJobRequested}
          onRevoke={onRevoke}
          onRename={onRename}
        />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">
            {t("columns.quantity")}
          </dt>
          <dd className="mt-1 tabular-nums">{batch.quantity}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">
            {t("columns.assignment")}
          </dt>
          <dd className="mt-2">
            <ActivationCodeAssignmentProgress batch={batch} />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">
            {t("columns.expiresAt")}
          </dt>
          <dd className="mt-1">{formatDate(batch.expiresAt, { locale })}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs font-medium uppercase text-slate-500">
            {t("columns.status")}
          </dt>
          <dd className="mt-2">
            <ActivationCodeStatusCounts batch={batch} />
          </dd>
        </div>
      </dl>
    </article>
  );
}

function ActivationCodeAssignmentProgress({
  batch,
}: {
  batch: ActivationCodeBatchListItem;
}) {
  const t = useTranslations("ActivationCodeBatches");

  return (
    <span className="inline-flex rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium tabular-nums text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
      {t("assignedProgress", {
        assigned: batch.assignedCount,
        total: batch.quantity,
      })}
    </span>
  );
}

function ProductSummary({ batch }: { batch: ActivationCodeBatchListItem }) {
  return (
    <div className="min-w-0 max-w-72">
      <p className="truncate font-medium">{batch.productName}</p>
      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
        {batch.productSku}
      </p>
    </div>
  );
}

function ActivationCodeStatusCounts({
  batch,
}: {
  batch: ActivationCodeBatchListItem;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {ACTIVATION_CODE_BATCH_STATUSES.map((status) => {
        const count = batch.statusCounts[status] ?? 0;
        if (count === 0) return null;

        return (
          <ActivationCodeStatusBadge
            className="px-2 py-1 text-xs"
            count={count}
            key={status}
            status={status}
          />
        );
      })}
    </div>
  );
}

function ActivationCodeBatchActionsMenu({
  batch,
  canPrint,
  canRevoke,
  onJobRequested,
  onRevoke,
  onRename,
}: {
  batch: ActivationCodeBatchListItem;
  canPrint: boolean;
  canRevoke: boolean;
  onJobRequested: ActivationCodeBatchesTableProps["onJobRequested"];
  onRevoke: ActivationCodeBatchesTableProps["onRevoke"];
  onRename: ActivationCodeBatchesTableProps["onRename"];
}) {
  const t = useTranslations("ActivationCodeBatches");
  const [printOpen, setPrintOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(batch.batchName);
  const canRevokeAvailable =
    canRevoke && (batch.statusCounts.AVAILABLE ?? 0) > 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={t("openActions", { batch: batch.batchCode })}
            className="size-10 md:size-9"
            size="icon"
            variant="ghost"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              setRenameValue(batch.batchName);
              setRenameOpen(true);
            }}
          >
            <Pencil className="mr-2 size-4" />
            {t("renameAction")}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/activation-code-batches/${batch.id}`}>
              <Eye className="mr-2 size-4" />
              {t("viewDetails")}
            </Link>
          </DropdownMenuItem>
          {canPrint ? (
            <DropdownMenuItem onSelect={() => setPrintOpen(true)}>
              <Printer className="mr-2 size-4" />
              {t("printAction")}
            </DropdownMenuItem>
          ) : null}
          {canRevokeAvailable ? (
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700 dark:text-red-400"
              onSelect={() => setRevokeOpen(true)}
            >
              <ShieldOff className="mr-2 size-4" />
              {t("revokeAction")}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      {canPrint ? (
        <ActivationCodePrintDialog
          batch={batch}
          onJobRequested={onJobRequested}
          onOpenChange={setPrintOpen}
          open={printOpen}
        />
      ) : null}
      <ConfirmActionDialog
        cancelLabel={t("cancel")}
        confirmLabel={t("revokeAction")}
        description={t("revokeConfirm", { batch: batch.batchCode })}
        onConfirm={() => {
          setRevokeOpen(false);
          onRevoke(batch);
        }}
        onOpenChange={setRevokeOpen}
        open={revokeOpen}
        title={t("revokeTitle")}
        variant="destructive"
      />
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="space-y-5 sm:max-w-xl">
          <div className="space-y-1.5">
            <DialogTitle className="text-lg font-semibold text-slate-950 dark:text-slate-50">
              {t("renameTitle")}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t("renameDescription")}
            </DialogDescription>
          </div>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              const nextName = renameValue.trim();
              if (!nextName) return;
              onRename(batch, nextName);
              setRenameOpen(false);
            }}
          >
            <label className="block space-y-2 text-sm font-medium text-slate-900 dark:text-slate-100">
              {t("renameInputLabel")}
              <Input
                autoFocus
                maxLength={120}
                onChange={(event) => setRenameValue(event.target.value)}
                value={renameValue}
              />
            </label>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {t("cancel")}
                </Button>
              </DialogClose>
              <Button disabled={!renameValue.trim()} type="submit">
                {t("renameSubmit")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
