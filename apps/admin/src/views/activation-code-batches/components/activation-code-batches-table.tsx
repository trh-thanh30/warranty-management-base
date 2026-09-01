"use client";

import { ShieldOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@repo/shared";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "@repo/ui";
import type { ActivationCodeBatchListItem } from "@/src/services/activation-codes/activation-code-batches.types";
import { ACTIVATION_CODE_BATCH_STATUSES } from "../activation-code-batches.constants";

type ActivationCodeBatchesTableProps = {
  canRevoke: boolean;
  items: ActivationCodeBatchListItem[];
  onRevoke: (batch: ActivationCodeBatchListItem) => void;
};

export function ActivationCodeBatchesTable({
  canRevoke,
  items,
  onRevoke,
}: ActivationCodeBatchesTableProps) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((batch) => (
          <ActivationCodeBatchMobileCard
            batch={batch}
            canRevoke={canRevoke}
            key={batch.id}
            onRevoke={onRevoke}
          />
        ))}
      </div>

      <TableScroll className="hidden rounded-md border border-slate-200 dark:border-slate-800 md:block">
        <Table className="min-w-[920px] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
          <TableHeader>
            <ActivationCodeBatchTableHeader />
          </TableHeader>
          <TableBody>
            {items.map((batch) => (
              <ActivationCodeBatchTableRow
                batch={batch}
                canRevoke={canRevoke}
                key={batch.id}
                onRevoke={onRevoke}
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
      <TableHead>{t("columns.product")}</TableHead>
      <TableHead>{t("columns.quantity")}</TableHead>
      <TableHead>{t("columns.status")}</TableHead>
      <TableHead>{t("columns.expiresAt")}</TableHead>
      <TableHead>{t("columns.createdAt")}</TableHead>
      <TableHead aria-label={t("columns.actions")} className="w-12" />
    </TableRow>
  );
}

function ActivationCodeBatchTableRow({
  batch,
  canRevoke,
  onRevoke,
}: {
  batch: ActivationCodeBatchListItem;
  canRevoke: boolean;
  onRevoke: ActivationCodeBatchesTableProps["onRevoke"];
}) {
  const locale = useLocale();

  return (
    <TableRow>
      <TableCell className="font-medium text-slate-950 dark:text-slate-50">
        {batch.batchCode}
      </TableCell>
      <TableCell>
        <ProductSummary batch={batch} />
      </TableCell>
      <TableCell className="tabular-nums">{batch.quantity}</TableCell>
      <TableCell>
        <ActivationCodeStatusCounts batch={batch} />
      </TableCell>
      <TableCell>{formatDate(batch.expiresAt, { locale })}</TableCell>
      <TableCell>{formatDate(batch.createdAt, { locale })}</TableCell>
      <TableCell className="text-right">
        <RevokeBatchButton
          batch={batch}
          canRevoke={canRevoke}
          onRevoke={onRevoke}
        />
      </TableCell>
    </TableRow>
  );
}

function ActivationCodeBatchMobileCard({
  batch,
  canRevoke,
  onRevoke,
}: {
  batch: ActivationCodeBatchListItem;
  canRevoke: boolean;
  onRevoke: ActivationCodeBatchesTableProps["onRevoke"];
}) {
  const locale = useLocale();
  const t = useTranslations("ActivationCodeBatches");

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-950 dark:text-slate-50">
            {batch.batchCode}
          </p>
          <ProductSummary batch={batch} />
        </div>
        <RevokeBatchButton
          batch={batch}
          canRevoke={canRevoke}
          onRevoke={onRevoke}
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
  const t = useTranslations("ActivationCodeBatches");

  return (
    <div className="flex flex-wrap gap-1">
      {ACTIVATION_CODE_BATCH_STATUSES.map((status) => {
        const count = batch.statusCounts[status] ?? 0;
        if (count === 0) return null;

        return (
          <span
            className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            key={status}
          >
            {t(`statuses.${status}`)}: {count}
          </span>
        );
      })}
    </div>
  );
}

function RevokeBatchButton({
  batch,
  canRevoke,
  onRevoke,
}: {
  batch: ActivationCodeBatchListItem;
  canRevoke: boolean;
  onRevoke: ActivationCodeBatchesTableProps["onRevoke"];
}) {
  const t = useTranslations("ActivationCodeBatches");

  if (!canRevoke || (batch.statusCounts.AVAILABLE ?? 0) === 0) return null;

  return (
    <Button
      aria-label={t("revokeAria", { batch: batch.batchCode })}
      className="size-10 md:size-9"
      onClick={() => onRevoke(batch)}
      size="icon"
      variant="ghost"
    >
      <ShieldOff className="size-4" />
    </Button>
  );
}
