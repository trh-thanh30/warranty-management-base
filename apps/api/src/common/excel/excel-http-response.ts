import type { Response } from 'express';

const EXCEL_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function createDatedExcelFilename(prefix: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}-${date}.xlsx`;
}

export function sendExcelFile(
  response: Response,
  buffer: Buffer,
  filename: string,
): void {
  response.setHeader('Content-Type', EXCEL_CONTENT_TYPE);
  response.setHeader(
    'Content-Disposition',
    `attachment; filename="${filename}"`,
  );
  response.send(buffer);
}
