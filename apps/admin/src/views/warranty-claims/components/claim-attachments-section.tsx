"use client";

import { useState } from "react";
import {
  ExternalLink,
  Eye,
  File,
  FileText,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { WarrantyClaimAttachmentSummary } from "@repo/shared";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui";
import { PaginationControls } from "@/src/components/common/pagination-controls";
import { formatAttachmentSize } from "../warranty-claims.utils";

const ATTACHMENTS_PAGE_SIZE = 6;

type ClaimAttachmentsSectionProps = {
  attachments: WarrantyClaimAttachmentSummary[];
  canUpdate: boolean;
  onAdd: () => void;
  onRemove: (attachment: WarrantyClaimAttachmentSummary) => void;
};

export function ClaimAttachmentsSection({
  attachments,
  canUpdate,
  onAdd,
  onRemove,
}: ClaimAttachmentsSectionProps) {
  const t = useTranslations("WarrantyClaims");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<WarrantyClaimAttachmentSummary | null>(
    null,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(attachments.length / ATTACHMENTS_PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * ATTACHMENTS_PAGE_SIZE;
  const visibleAttachments = attachments.slice(
    startIndex,
    startIndex + ATTACHMENTS_PAGE_SIZE,
  );

  return (
    <section className="p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <File className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
          <h2 className="truncate font-semibold text-slate-950 dark:text-slate-50">
            {t("attachments")}
          </h2>
          {attachments.length > 0 ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {attachments.length}
            </span>
          ) : null}
        </div>
        {canUpdate ? (
          <Button
            className="shrink-0"
            onClick={onAdd}
            size="sm"
            type="button"
            variant="secondary"
          >
            <Plus className="size-4" aria-hidden="true" />
            {t("addAttachments")}
          </Button>
        ) : null}
      </div>

      {attachments.length > 0 ? (
        <>
          <div className="mt-4 min-h-[26rem] sm:min-h-[29rem]">
            <ul className="overflow-hidden rounded-lg border border-slate-200 sm:hidden dark:border-slate-800">
              {visibleAttachments.map((attachment, index) => (
                <MobileAttachmentItem
                  attachment={attachment}
                  canUpdate={canUpdate}
                  className={
                    index > 0
                      ? "border-t border-slate-200 dark:border-slate-800"
                      : ""
                  }
                  key={attachment.id}
                  onPreview={setPreview}
                  onRemove={onRemove}
                />
              ))}
            </ul>

            <ul className="hidden grid-cols-2 gap-3 sm:grid">
              {visibleAttachments.map((attachment) => (
                <GalleryAttachmentItem
                  attachment={attachment}
                  canUpdate={canUpdate}
                  key={attachment.id}
                  onPreview={setPreview}
                  onRemove={onRemove}
                />
              ))}
            </ul>
          </div>

          {totalPages > 1 ? (
            <PaginationControls
              className="border-t border-slate-200 pt-3 dark:border-slate-800"
              nextLabel={t("next")}
              onPageChange={setPage}
              page={currentPage}
              previousLabel={t("previous")}
              summary={t("attachmentPagination", {
                from: startIndex + 1,
                to: Math.min(
                  startIndex + ATTACHMENTS_PAGE_SIZE,
                  attachments.length,
                ),
                total: attachments.length,
              })}
              totalPages={totalPages}
              variant="compact"
            />
          ) : null}
        </>
      ) : (
        <p className="mt-4 text-sm text-slate-500">{t("noAttachments")}</p>
      )}

      <AttachmentPreviewDialog preview={preview} setPreview={setPreview} />
    </section>
  );
}

function MobileAttachmentItem({
  attachment,
  canUpdate,
  className,
  onPreview,
  onRemove,
}: {
  attachment: WarrantyClaimAttachmentSummary;
  canUpdate: boolean;
  className: string;
  onPreview: (attachment: WarrantyClaimAttachmentSummary) => void;
  onRemove: (attachment: WarrantyClaimAttachmentSummary) => void;
}) {
  const isImage = attachment.mimeType.startsWith("image/");

  return (
    <li className={`flex min-w-0 items-center gap-3 p-2.5 ${className}`}>
      <AttachmentThumbnail
        attachment={attachment}
        className="size-12 shrink-0"
        onPreview={onPreview}
      />
      <AttachmentMetadata attachment={attachment} />
      <AttachmentActionsMenu
        attachment={attachment}
        canUpdate={canUpdate}
        onPreview={isImage ? onPreview : undefined}
        onRemove={onRemove}
      />
    </li>
  );
}

function GalleryAttachmentItem({
  attachment,
  canUpdate,
  onPreview,
  onRemove,
}: {
  attachment: WarrantyClaimAttachmentSummary;
  canUpdate: boolean;
  onPreview: (attachment: WarrantyClaimAttachmentSummary) => void;
  onRemove: (attachment: WarrantyClaimAttachmentSummary) => void;
}) {
  const isImage = attachment.mimeType.startsWith("image/");

  return (
    <li className="group min-w-0">
      <div className="relative aspect-[4/3]">
        <AttachmentThumbnail
          attachment={attachment}
          className="size-full"
          onPreview={onPreview}
        />
        <div className="absolute right-1.5 top-1.5">
          <AttachmentActionsMenu
            attachment={attachment}
            canUpdate={canUpdate}
            onPreview={isImage ? onPreview : undefined}
            onRemove={onRemove}
            overlay
          />
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <AttachmentMetadata attachment={attachment} />
      </div>
    </li>
  );
}

function AttachmentThumbnail({
  attachment,
  className,
  onPreview,
}: {
  attachment: WarrantyClaimAttachmentSummary;
  className: string;
  onPreview: (attachment: WarrantyClaimAttachmentSummary) => void;
}) {
  const t = useTranslations("WarrantyClaims");
  const isImage = attachment.mimeType.startsWith("image/");
  const baseClassName = `${className} overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800`;

  if (!isImage) {
    return (
      <span className={`flex items-center justify-center ${baseClassName}`}>
        <FileText aria-hidden="true" className="size-5 text-slate-500" />
      </span>
    );
  }

  return (
    <button
      aria-label={t("previewAttachment", { name: attachment.originalName })}
      className={`${baseClassName} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-100`}
      onClick={() => onPreview(attachment)}
      type="button"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.02] motion-reduce:transition-none"
        src={attachment.url}
      />
    </button>
  );
}

function AttachmentMetadata({
  attachment,
}: {
  attachment: WarrantyClaimAttachmentSummary;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p
        className="truncate text-sm font-medium text-slate-950 dark:text-slate-50"
        title={attachment.originalName}
      >
        {attachment.originalName}
      </p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        {formatAttachmentSize(attachment.size)}
      </p>
    </div>
  );
}

function AttachmentActionsMenu({
  attachment,
  canUpdate,
  onPreview,
  onRemove,
  overlay = false,
}: {
  attachment: WarrantyClaimAttachmentSummary;
  canUpdate: boolean;
  onPreview?: (attachment: WarrantyClaimAttachmentSummary) => void;
  onRemove: (attachment: WarrantyClaimAttachmentSummary) => void;
  overlay?: boolean;
}) {
  const t = useTranslations("WarrantyClaims");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("openAttachmentActions", {
            name: attachment.originalName,
          })}
          className={
            overlay
              ? "size-9 border border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-sm hover:bg-white dark:border-slate-700 dark:bg-slate-950/90"
              : "size-10 shrink-0"
          }
          size="icon"
          type="button"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onPreview ? (
          <DropdownMenuItem onSelect={() => onPreview(attachment)}>
            <Eye aria-hidden="true" className="mr-2 size-4" />
            {t("preview")}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <a href={attachment.url} rel="noopener noreferrer" target="_blank">
            <ExternalLink aria-hidden="true" className="mr-2 size-4" />
            {t("openInNewTab")}
          </a>
        </DropdownMenuItem>
        {canUpdate ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/40"
              onSelect={() => onRemove(attachment)}
            >
              <Trash2 aria-hidden="true" className="mr-2 size-4" />
              {t("removeFile")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AttachmentPreviewDialog({
  preview,
  setPreview,
}: {
  preview: WarrantyClaimAttachmentSummary | null;
  setPreview: (attachment: WarrantyClaimAttachmentSummary | null) => void;
}) {
  const t = useTranslations("WarrantyClaims");

  return (
    <Dialog
      onOpenChange={(open) => !open && setPreview(null)}
      open={Boolean(preview)}
    >
      <DialogContent className="w-[min(calc(100vw-2rem),56rem)] p-4 sm:p-5">
        <DialogTitle className="truncate pr-8 text-lg font-semibold">
          {preview?.originalName}
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {preview ? formatAttachmentSize(preview.size) : ""}
        </DialogDescription>
        {preview ? (
          <div className="mt-4 space-y-3">
            <div className="flex max-h-[70vh] items-center justify-center overflow-auto rounded-md bg-slate-100 p-2 dark:bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={preview.originalName}
                className="max-h-[62vh] max-w-full object-contain"
                src={preview.url}
              />
            </div>
            <div className="flex justify-end">
              <Button asChild variant="secondary">
                <a href={preview.url} rel="noopener noreferrer" target="_blank">
                  <ExternalLink aria-hidden="true" className="size-4" />
                  {t("openInNewTab")}
                </a>
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
