"use client";

import { useCallback } from "react";

export function useExcel() {
  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, []);

  const createDatedFilename = useCallback((prefix: string) => {
    const date = new Date().toISOString().slice(0, 10);
    return `${prefix}-${date}.xlsx`;
  }, []);

  return { createDatedFilename, downloadBlob };
}
