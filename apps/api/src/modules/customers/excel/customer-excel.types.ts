export type CustomerExcelRow = {
  customerCode: string | null;
  fullName: string;
  phone: string;
  email: string;
  address: string;
};

export type CustomerImportResult = {
  created: number;
  updated: number;
  errors: Array<{
    rowNumber: number;
    field: string;
    message: string;
  }>;
};
