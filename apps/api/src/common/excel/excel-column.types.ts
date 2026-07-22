export type ExcelCellValue = string | number | boolean | Date | null;

export type ExcelColumnDefinition<Row> = {
  key: keyof Row & string;
  header: string;
  required?: boolean;
  width?: number;
  example?: ExcelCellValue;
  note?: string;
  parse?: (value: ExcelCellValue) => Row[keyof Row] | null;
  format?: (value: Row[keyof Row]) => ExcelCellValue;
};

export type ExcelRowError = {
  rowNumber: number;
  field: string;
  message: string;
};

export type ExcelImportPreview<Row> = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: Array<{
    rowNumber: number;
    data: Partial<Row>;
    errors: ExcelRowError[];
  }>;
  errors: ExcelRowError[];
};
