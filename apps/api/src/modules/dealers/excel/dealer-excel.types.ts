export type DealerExcelRow = {
  address: string;
  isActive: boolean;
  name: string;
  phone: string | null;
  province: string;
  district: string | null;
  salesName: string | null;
};

export type PreparedDealerImportRow = DealerExcelRow & {
  existingDealerId: string | null;
  rowNumber: number;
};
