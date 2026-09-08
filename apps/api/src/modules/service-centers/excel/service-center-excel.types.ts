export type ServiceCenterExcelRow = {
  name: string;
  phone: string | null;
  email: string | null;
  province: string;
  district: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
};

export type PreparedServiceCenterImportRow = ServiceCenterExcelRow & {
  existingServiceCenterId: string | null;
  rowNumber: number;
};
