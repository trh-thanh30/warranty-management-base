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

  const downloadRowsAsExcel = useCallback(
    async (
      rows: Array<Record<string, string>>,
      filename: string,
      sheetName: string,
    ) => {
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, filename);
    },
    [],
  );

  return { createDatedFilename, downloadBlob, downloadRowsAsExcel };
}
