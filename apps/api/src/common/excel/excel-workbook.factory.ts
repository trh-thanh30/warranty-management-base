import {
  ExcelCellValue,
  ExcelColumnDefinition,
} from '@/common/excel/excel-column.types';
import { Workbook, Worksheet } from 'exceljs';

const headerFill = {
  type: 'pattern' as const,
  pattern: 'solid' as const,
  fgColor: { argb: 'FF1F4E78' },
};

export function createExcelWorkbook(title: string) {
  const workbook = new Workbook();
  workbook.creator = 'Warranty Management';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.subject = title;

  return workbook;
}

export function addDataWorksheet<Row extends Record<string, unknown>>(
  workbook: Workbook,
  options: {
    name: string;
    columns: Array<ExcelColumnDefinition<Row>>;
    rows: Row[];
  },
) {
  const worksheet = workbook.addWorksheet(options.name);
  worksheet.columns = options.columns.map((column) => ({
    key: column.key,
    header: column.required ? `${column.header} *` : column.header,
    width: column.width ?? 18,
  }));
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: options.columns.length },
  };

  styleHeader(worksheet);

  for (const row of options.rows) {
    worksheet.addRow(toExcelRow(row, options.columns));
  }

  return worksheet;
}

export function addInstructionsWorksheet<Row extends Record<string, unknown>>(
  workbook: Workbook,
  columns: Array<ExcelColumnDefinition<Row>>,
) {
  const worksheet = workbook.addWorksheet('Instructions');
  worksheet.columns = [
    { key: 'column', header: 'Column', width: 28 },
    { key: 'required', header: 'Required', width: 12 },
    { key: 'example', header: 'Example', width: 24 },
    { key: 'note', header: 'Note', width: 48 },
  ];
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  styleHeader(worksheet);

  columns.forEach((column) => {
    worksheet.addRow({
      column: column.header,
      required: column.required ? 'Yes' : 'No',
      example: column.example,
      note: column.note ?? '',
    });
  });

  return worksheet;
}

export async function workbookToBuffer(workbook: Workbook) {
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function styleHeader(worksheet: Worksheet) {
  const header = worksheet.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = headerFill;
  header.alignment = { vertical: 'middle' };
  header.height = 22;
}

function toExcelRow<Row extends Record<string, unknown>>(
  row: Row,
  columns: Array<ExcelColumnDefinition<Row>>,
) {
  return columns.reduce<Record<string, ExcelCellValue>>((result, column) => {
    const value = row[column.key] as Row[keyof Row];
    result[column.key] = column.format
      ? column.format(value)
      : toCellValue(value);
    return result;
  }, {});
}

function toCellValue(value: unknown): ExcelCellValue {
  if (
    value === null ||
    value instanceof Date ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (value === undefined) {
    return null;
  }

  return JSON.stringify(value);
}
