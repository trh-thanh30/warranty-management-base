export type DealerExcelRow = {
  address: string;
  isActive: boolean;
  name: string;
  phone: string | null;
  province: string;
  district: string | null;
  latitude: number;
  longitude: number;
  salesName: string | null;
};

export type PreparedDealerImportRow = DealerExcelRow & {
  dealerCode: string | null;
  existingDealerId: string | null;
  rowNumber: number;
};
