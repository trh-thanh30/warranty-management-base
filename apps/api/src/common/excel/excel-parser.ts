import {
  ExcelCellValue,
  ExcelColumnDefinition,
  ExcelImportPreview,
  ExcelRowError,
} from '@/common/excel/excel-column.types';
import { ValidationError } from '@/common/response';
import { Workbook, Worksheet } from 'exceljs';

export async function loadWorkbookFromBuffer(buffer: Buffer) {
  const workbook = new Workbook();
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(arrayBuffer).set(buffer);
  await workbook.xlsx.load(arrayBuffer);
  return workbook;
}

export function parseWorksheetRows<Row extends Record<string, unknown>>(
  worksheet: Worksheet,
  columns: Array<ExcelColumnDefinition<Row>>,
): ExcelImportPreview<Row> {
  const headerRow = worksheet.getRow(1);
  const headerIndexByName = new Map<string, number>();

  headerRow.eachCell((cell, columnNumber) => {
    const header = normalizeHeader(cell.text);
    if (header) {
      headerIndexByName.set(header, columnNumber);
    }
  });

  const missingHeaders = columns.filter(
    (column) => !headerIndexByName.has(normalizeHeader(column.header)),
  );

  if (missingHeaders.length > 0) {
    throw new ValidationError(
      'Excel template headers are invalid',
      'INVALID_EXCEL_HEADERS',
      {
        missingHeaders: missingHeaders.map((column) => column.header),
      },
    );
  }

  const rowResults: ExcelImportPreview<Row>['rows'] = [];
  const errors: ExcelRowError[] = [];

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    if (isEmptyRow(row.values)) {
      continue;
    }

    const data: Partial<Row> = {};
    const rowErrors: ExcelRowError[] = [];

    for (const column of columns) {
      const columnNumber = headerIndexByName.get(
        normalizeHeader(column.header),
      );
      const rawValue = normalizeCellValue(row.getCell(columnNumber ?? 1).value);

      if (column.required && isBlankValue(rawValue)) {
        rowErrors.push({
          rowNumber,
          field: column.key,
          message: `${column.header} is required`,
        });
        continue;
      }

      if (isBlankValue(rawValue)) {
        (data as Record<string, unknown>)[column.key] = null;
        continue;
      }

      try {
        (data as Record<string, unknown>)[column.key] = column.parse
          ? column.parse(rawValue)
          : rawValue;
      } catch (error) {
        rowErrors.push({
          rowNumber,
          field: column.key,
          message: error instanceof Error ? error.message : 'Invalid value',
        });
      }
    }

    rowResults.push({ rowNumber, data, errors: rowErrors });
    errors.push(...rowErrors);
  }

  return {
    totalRows: rowResults.length,
    validRows: rowResults.filter((row) => row.errors.length === 0).length,
    invalidRows: rowResults.filter((row) => row.errors.length > 0).length,
    rows: rowResults,
    errors,
  };
}

export function normalizeCellValue(value: unknown): ExcelCellValue {
  if (value === undefined || value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'object' && 'text' in value) {
    return String(value.text);
  }

  if (typeof value === 'object' && 'result' in value) {
    return normalizeCellValue(value.result);
  }

  return JSON.stringify(value);
}

function normalizeHeader(value: string) {
  return value
    .trim()
    .replace(/\s+\*$/, '')
    .toLowerCase();
}

function isBlankValue(value: ExcelCellValue) {
  return value === null || (typeof value === 'string' && value.trim() === '');
}

function isEmptyRow(values: unknown) {
  if (!Array.isArray(values)) {
    return true;
  }

  return values
    .slice(1)
    .every((value) => isBlankValue(normalizeCellValue(value)));
}
