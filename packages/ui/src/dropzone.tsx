"use client";

import { Eye, FileImage, FileVideo, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { cn } from "./lib/utils";
import { MediaPreviewDialog } from "./media-preview-dialog";

export type DropzoneProps = {
  accept?: string;
  chooseLabel: string;
  className?: string;
  disabled?: boolean;
  files: File[];
  hint?: string;
  id: string;
  onFilesChange: (files: File[]) => void;
  onDuplicateFiles?: (count: number) => void;
  previewFileLabel: (fileName: string) => string;
  closePreviewLabel: string;
  removeFileLabel: (fileName: string) => string;
  selectedFilesLabel: string;
};

export function Dropzone({
  accept,
  chooseLabel,
  className,
  disabled,
  files,
  hint,
  id,
  onFilesChange,
  onDuplicateFiles,
  previewFileLabel,
  closePreviewLabel,
  removeFileLabel,
  selectedFilesLabel,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function addFiles(incomingFiles: File[]) {
    const existing = new Set(files.map(getFileIdentity));
    const uniqueFiles: File[] = [];
    let duplicateCount = 0;

    for (const file of incomingFiles) {
      const identity = getFileIdentity(file);
      if (existing.has(identity)) {
        duplicateCount += 1;
      } else {
        existing.add(identity);
        uniqueFiles.push(file);
      }
    }

    if (duplicateCount > 0) onDuplicateFiles?.(duplicateCount);
    onFilesChange([...files, ...uniqueFiles]);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) addFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <div className={cn("min-w-0", className)}>
      <button
        aria-controls={id}
        aria-label={chooseLabel}
        className={cn(
          "flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center transition-colors duration-200 hover:border-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-500 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-100/30",
          isDragging &&
            "border-slate-950 bg-slate-100 dark:border-slate-100 dark:bg-slate-900",
        )}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        type="button"
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
          <UploadCloud className="size-5" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-slate-950 dark:text-slate-50">
          {chooseLabel}
        </span>
        {hint ? (
          <span className="max-w-lg text-xs leading-5 text-slate-500 dark:text-slate-400">
            {hint}
          </span>
        ) : null}
      </button>

      <input
        accept={accept}
        className="sr-only"
        disabled={disabled}
        id={id}
        multiple
        onChange={(event) => {
          addFiles(Array.from(event.currentTarget.files ?? []));
          event.currentTarget.value = "";
        }}
        ref={inputRef}
        type="file"
      />

      {files.length > 0 ? (
        <ul className="mt-3 space-y-2" aria-label={selectedFilesLabel}>
          {files.map((file) => {
            const fileId = getFileIdentity(file);
            return (
              <li
                className="flex min-w-0 items-center gap-3 rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
                key={fileId}
              >
                <FilePreview
                  closePreviewLabel={closePreviewLabel}
                  file={file}
                  previewFileLabel={previewFileLabel(file.name)}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-950 dark:text-slate-50">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  aria-label={removeFileLabel(file.name)}
                  className="flex size-10 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950/30 disabled:opacity-60 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:focus-visible:ring-slate-100/30"
                  disabled={disabled}
                  onClick={() =>
                    onFilesChange(
                      files.filter((item) => getFileIdentity(item) !== fileId),
                    )
                  }
                  type="button"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function FilePreview({
  closePreviewLabel,
  file,
  previewFileLabel,
}: {
  closePreviewLabel: string;
  file: File;
  previewFileLabel: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!previewUrl) {
    const Icon = file.type.startsWith("video/") ? FileVideo : FileImage;
    return (
      <span className="flex size-16 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-900">
        <Icon className="size-5" aria-hidden="true" />
      </span>
    );
  }

  return (
    <>
      <button
        aria-label={previewFileLabel}
        className="group relative size-16 shrink-0 overflow-hidden rounded-md bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:bg-slate-900 dark:focus-visible:ring-slate-50"
        onClick={() => setPreviewOpen(true)}
        title={previewFileLabel}
        type="button"
      >
        {file.type.startsWith("video/") ? (
          <video
            aria-hidden="true"
            className="size-full object-cover"
            muted
            playsInline
            preload="metadata"
            src={previewUrl}
          />
        ) : (
          <img
            alt=""
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105"
            src={previewUrl}
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-slate-950/35 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
          <span className="flex size-9 items-center justify-center rounded-full bg-white text-slate-950 shadow-md">
            <Eye aria-hidden="true" className="size-5" />
          </span>
        </span>
      </button>

      <MediaPreviewDialog
        closeLabel={closePreviewLabel}
        items={[
          {
            alt: file.name,
            src: previewUrl,
            type: file.type.startsWith("video/") ? "video" : "image",
          },
        ]}
        onOpenChange={setPreviewOpen}
        open={previewOpen}
      />
    </>
  );
}

function getFileIdentity(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
