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
  downloadTemplate: string;
  exportAll: string;
  title: string;
  upload: string;
};

type ImportExportMenuProps = {
  disabled?: boolean;
  labels: ImportExportMenuLabels;
  onDownloadTemplate: () => void;
  onExportAll: () => void;
  onUpload: () => void;
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
          className="h-10 border-slate-200 bg-white px-3 text-slate-800 shadow-sm hover:bg-slate-50"
          disabled={disabled}
          variant="secondary"
        >
          <FileSpreadsheet className="size-4 text-slate-700" />
          <span>{labels.title}</span>
          <ChevronDown className="size-4 text-slate-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5">
        <DropdownMenuItem
          className="gap-2.5 px-3 py-2.5"
          disabled={uploadDisabled}
          onSelect={onUpload}
        >
          <Upload className="size-4 text-blue-600" />
          <span>{labels.upload}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2.5 px-3 py-2.5"
          onSelect={onDownloadTemplate}
        >
          <FileDown className="size-4 text-emerald-600" />
          <span>{labels.downloadTemplate}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2.5 px-3 py-2.5"
          onSelect={onExportAll}
        >
          <Download className="size-4 text-emerald-600" />
          <span>{labels.exportAll}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
