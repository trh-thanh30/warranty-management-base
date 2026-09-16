"use client";

import {
  ChevronDown,
  Download,
  FileDown,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui";

type ImportExportMenuLabels = {
  downloadTemplate?: string;
  exportAll: string;
  title: string;
  upload?: string;
};

type ImportExportMenuProps = {
  disabled?: boolean;
  labels: ImportExportMenuLabels;
  onDownloadTemplate?: () => void;
  onExportAll: () => void;
  onUpload?: () => void;
  uploadDisabled?: boolean;
};

export function ImportExportMenu({
  disabled,
  labels,
  onDownloadTemplate,
  onExportAll,
  onUpload,
  uploadDisabled,
}: ImportExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={labels.title}
          className="group h-10 w-full justify-center border-slate-200 bg-white px-3 text-slate-800 shadow-sm outline-none hover:bg-slate-50 focus-visible:outline-none sm:w-auto"
          disabled={disabled}
          variant="secondary"
        >
          <div className="inline-flex items-center justify-center gap-2 sm:w-auto">
            <FileSpreadsheet className="size-4 shrink-0 text-slate-700" />
            <span>{labels.title}</span>
            <ChevronDown className="size-4 shrink-0 text-slate-500 transition-transform duration-150 group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-max min-w-64 max-w-[calc(100vw-2rem)] origin-[var(--radix-dropdown-menu-content-transform-origin)] p-1.5 outline-none duration-150 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:animate-none"
      >
        {onUpload && labels.upload ? (
          <DropdownMenuItem
            className="gap-2.5 whitespace-nowrap px-3 py-2.5"
            disabled={uploadDisabled}
            onSelect={onUpload}
          >
            <Upload className="size-4 text-blue-600" />
            <span>{labels.upload}</span>
          </DropdownMenuItem>
        ) : null}
        {onUpload && onDownloadTemplate ? <DropdownMenuSeparator /> : null}
        {onDownloadTemplate && labels.downloadTemplate ? (
          <DropdownMenuItem
            className="gap-2.5 whitespace-nowrap px-3 py-2.5"
            onSelect={onDownloadTemplate}
          >
            <FileDown className="size-4 text-emerald-600" />
            <span>{labels.downloadTemplate}</span>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          className="gap-2.5 whitespace-nowrap px-3 py-2.5"
          onSelect={onExportAll}
        >
          <Download className="size-4 text-emerald-600" />
          <span>{labels.exportAll}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
