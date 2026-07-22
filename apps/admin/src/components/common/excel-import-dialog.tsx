"use client";

import { ChangeEvent, ReactNode, useId, useRef, useState } from "react";
import { CloudUpload, FileSpreadsheet, Loader2, X } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  cn,
} from "@repo/ui";

export type ExcelImportMode = "replace" | "upsert";

type ExcelImportDialogLabels = {
  backToUpload?: string;
  cancel: string;
  confirmImport?: string;
  chooseFile: string;
  execute: string;
  fileHelp: string;
  fileLabel: string;
  modeLabel: string;
  replaceDescription: string;
  replaceLabel: string;
  title: string;
  upsertDescription: string;
  upsertLabel: string;
};

type ExcelImportDialogProps = {
  confirmDisabled?: boolean;
  description: string;
  isConfirming?: boolean;
  isSubmitting?: boolean;
  labels: ExcelImportDialogLabels;
  onBackToUpload?: () => void;
  onConfirm?: () => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (file: File, mode: ExcelImportMode) => Promise<void> | void;
  open: boolean;
  previewContent?: ReactNode;
  previewSummary?: ReactNode;
  showModeSelector?: boolean;
  size?: "default" | "wide";
};

export function ExcelImportDialog({
  confirmDisabled = false,
  description,
  isConfirming = false,
  isSubmitting = false,
  labels,
  onBackToUpload,
  onConfirm,
  onOpenChange,
  onSubmit,
  open,
  previewContent,
  previewSummary,
  showModeSelector = true,
  size = "default",
}: ExcelImportDialogProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ExcelImportMode>("upsert");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setFile(null);
      setMode("upsert");
    }

    onOpenChange(nextOpen);
  }

  const hasPreview = Boolean(previewContent);

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent
        className={cn(
          "max-h-[calc(100vh-2rem)] overflow-hidden p-0",
          hasPreview
            ? cn(
                "max-w-none",
                size === "wide"
                  ? "w-[min(calc(100vw-1rem),96rem)]"
                  : "w-[min(calc(100vw-2rem),72rem)]",
              )
            : size === "wide"
              ? "w-[min(calc(100vw-2rem),48rem)] max-w-none"
              : "w-[min(calc(100vw-2rem),36rem)]",
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-8">
          <div className="space-y-1.5">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <FileSpreadsheet className="size-5 text-blue-600" />
              {labels.title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-500">
              {description}
            </DialogDescription>
          </div>
          <button
            aria-label={labels.cancel}
            className="mt-0.5 rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            onClick={() => handleOpenChange(false)}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto px-6 pb-6 pt-4 sm:px-8">
          {hasPreview ? (
            <div className="space-y-4">
              {previewSummary}
              {previewContent}
              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <Button
                  onClick={onBackToUpload}
                  type="button"
                  variant="secondary"
                >
                  {labels.backToUpload ?? labels.cancel}
                </Button>
                <Button
                  onClick={() => handleOpenChange(false)}
                  type="button"
                  variant="secondary"
                >
                  {labels.cancel}
                </Button>
                <Button
                  className="min-w-36 bg-blue-500 hover:bg-blue-600"
                  disabled={confirmDisabled || isConfirming}
                  onClick={() => {
                    void onConfirm?.();
                  }}
                  type="button"
                >
                  {isConfirming ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  {labels.confirmImport ?? labels.execute}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <label
                  className="text-sm font-medium text-slate-900"
                  htmlFor={inputId}
                >
                  {labels.fileLabel}
                </label>
                <button
                  className={cn(
                    "flex min-h-32 w-full flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white px-4 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                    file && "border-blue-300 bg-blue-50/60",
                  )}
                  onClick={() => inputRef.current?.click()}
                  type="button"
                >
                  <CloudUpload className="mb-3 size-9 text-slate-400" />
                  <span className="text-sm font-medium text-slate-800">
                    {file?.name ?? labels.chooseFile}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    {labels.fileHelp}
                  </span>
                </button>
                <input
                  accept=".xlsx,.xls"
                  className="sr-only"
                  id={inputId}
                  onChange={handleFileChange}
                  ref={inputRef}
                  type="file"
                />
              </div>

              {showModeSelector ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-900">
                    {labels.modeLabel}
                  </p>
                  <ImportModeOption
                    checked={mode === "upsert"}
                    description={labels.upsertDescription}
                    label={labels.upsertLabel}
                    onSelect={() => setMode("upsert")}
                    tone="blue"
                  />
                  <ImportModeOption
                    checked={mode === "replace"}
                    description={labels.replaceDescription}
                    label={labels.replaceLabel}
                    onSelect={() => setMode("replace")}
                    tone="red"
                  />
                </div>
              ) : null}

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  onClick={() => handleOpenChange(false)}
                  type="button"
                  variant="secondary"
                >
                  {labels.cancel}
                </Button>
                <Button
                  className="min-w-32 bg-blue-500 hover:bg-blue-600"
                  disabled={!file || isSubmitting}
                  onClick={() => {
                    if (file) void onSubmit(file, mode);
                  }}
                  type="button"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  {labels.execute}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ImportModeOption({
  checked,
  description,
  label,
  onSelect,
  tone,
}: {
  checked: boolean;
  description: string;
  label: string;
  onSelect: () => void;
  tone: "blue" | "red";
}) {
  return (
    <button
      className={cn(
        "flex w-full gap-3 rounded-md border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
        checked
          ? "border-blue-500 bg-blue-50"
          : "border-slate-200 bg-white hover:border-slate-300",
      )}
      onClick={onSelect}
      type="button"
    >
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
          checked ? "border-blue-500 bg-blue-500" : "border-slate-300 bg-white",
        )}
      >
        <span
          className={cn(
            "size-2.5 rounded-full bg-white",
            checked ? "opacity-100" : "opacity-0",
          )}
        />
      </span>
      <span className="space-y-1">
        <span
          className={cn(
            "block text-sm font-medium",
            tone === "red" ? "text-red-600" : "text-slate-900",
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "block text-xs leading-5",
            tone === "red" ? "text-red-500" : "text-slate-500",
          )}
        >
          {description}
        </span>
      </span>
    </button>
  );
}
