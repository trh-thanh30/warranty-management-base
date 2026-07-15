"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@repo/ui";
import {
  WARRANTY_CLAIM_ATTACHMENT_ACCEPT,
  WARRANTY_CLAIM_ATTACHMENT_MAX_FILES,
} from "../warranty-claims.constants";
import {
  formatAttachmentSize,
  validateWarrantyClaimAttachment,
} from "../warranty-claims.utils";

type UploadStatus = "error" | "pending" | "success" | "uploading";

type UploadItem = {
  errorKey?:
    | "attachmentTooLarge"
    | "attachmentTypeInvalid"
    | "attachmentUploadError";
  file: File;
  id: string;
  retryable: boolean;
  status: UploadStatus;
};

type UploadClaimAttachmentsDialogProps = {
  onCompleted: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
  onUploadFile: (file: File) => Promise<void>;
  open: boolean;
};

export function UploadClaimAttachmentsDialog({
  onCompleted,
  onOpenChange,
  onUploadFile,
  open,
}: UploadClaimAttachmentsDialogProps) {
  const t = useTranslations("WarrantyClaims");
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const isUploading = items.some((item) => item.status === "uploading");
  const hasValidationErrors = items.some(
    (item) => item.status === "error" && !item.retryable,
  );
  const uploadableItems = items.filter(
    (item) =>
      item.status === "pending" || (item.status === "error" && item.retryable),
  );

  useEffect(() => {
    if (!open) {
      setItems([]);
      setGeneralError(null);
    }
  }, [open]);

  function addFiles(files: File[]) {
    setGeneralError(null);
    setItems((currentItems) => {
      const existingIds = new Set(currentItems.map((item) => item.id));
      const nextFiles = files.filter(
        (file) => !existingIds.has(getFileId(file)),
      );

      if (
        currentItems.length + nextFiles.length >
        WARRANTY_CLAIM_ATTACHMENT_MAX_FILES
      ) {
        setGeneralError(
          t("attachmentTooMany", {
            count: WARRANTY_CLAIM_ATTACHMENT_MAX_FILES,
          }),
        );
        return currentItems;
      }

      return [
        ...currentItems,
        ...nextFiles.map((file): UploadItem => {
          const validationError = validateWarrantyClaimAttachment(file);
          return {
            errorKey: validationError ?? undefined,
            file,
            id: getFileId(file),
            retryable: false,
            status: validationError ? "error" : "pending",
          };
        }),
      ];
    });
  }

  function removeFile(id: string) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  async function uploadFiles() {
    let failed = false;

    for (const item of uploadableItems) {
      setItems((currentItems) =>
        updateItem(currentItems, item.id, {
          errorKey: undefined,
          retryable: false,
          status: "uploading",
        }),
      );

      try {
        await onUploadFile(item.file);
        setItems((currentItems) =>
          updateItem(currentItems, item.id, { status: "success" }),
        );
      } catch {
        failed = true;
        setItems((currentItems) =>
          updateItem(currentItems, item.id, {
            errorKey: "attachmentUploadError",
            retryable: true,
            status: "error",
          }),
        );
      }
    }

    if (!failed) {
      await onCompleted();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:p-6">
        <DialogTitle className="text-lg font-semibold">
          {t("uploadAttachmentsTitle")}
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("uploadAttachmentsDescription")}
        </DialogDescription>

        <button
          className="mt-5 flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition-colors hover:border-slate-400 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-600 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-100"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <UploadCloud className="size-6 text-slate-500" aria-hidden="true" />
          <span className="text-sm font-medium text-slate-950 dark:text-slate-50">
            {t("chooseAttachments")}
          </span>
          <span className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            {t("attachmentUploadHint")}
          </span>
        </button>
        <input
          accept={WARRANTY_CLAIM_ATTACHMENT_ACCEPT}
          className="sr-only"
          disabled={isUploading}
          multiple
          onChange={(event) => {
            addFiles(Array.from(event.target.files ?? []));
            event.currentTarget.value = "";
          }}
          ref={inputRef}
          type="file"
        />

        {generalError ? (
          <p
            className="mt-3 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {generalError}
          </p>
        ) : null}

        {items.length > 0 ? (
          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
            {items.map((item) => (
              <li
                className="flex min-w-0 items-center gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-800"
                key={item.id}
              >
                <UploadStatusIcon status={item.status} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-950 dark:text-slate-50">
                    {item.file.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {item.errorKey
                      ? t(item.errorKey)
                      : `${formatAttachmentSize(item.file.size)} · ${t(`attachmentStatuses.${item.status}`)}`}
                  </p>
                </div>
                <Button
                  aria-label={t("removeSelectedAttachment", {
                    name: item.file.name,
                  })}
                  disabled={item.status === "uploading"}
                  onClick={() => removeFile(item.id)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button disabled={isUploading} type="button" variant="secondary">
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button
            disabled={
              isUploading || hasValidationErrors || uploadableItems.length === 0
            }
            onClick={() => {
              void uploadFiles();
            }}
            type="button"
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <UploadCloud className="size-4" aria-hidden="true" />
            )}
            {isUploading ? t("uploadingAttachments") : t("uploadAttachments")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UploadStatusIcon({ status }: { status: UploadStatus }) {
  if (status === "uploading") {
    return <Loader2 className="size-5 shrink-0 animate-spin text-slate-500" />;
  }
  if (status === "success") {
    return <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />;
  }
  if (status === "error") {
    return <AlertCircle className="size-5 shrink-0 text-red-600" />;
  }

  return <FileText className="size-5 shrink-0 text-slate-500" />;
}

function getFileId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function updateItem(
  items: UploadItem[],
  id: string,
  update: Partial<UploadItem>,
) {
  return items.map((item) => (item.id === id ? { ...item, ...update } : item));
}
