export type ServiceCenterExcelRow = {
  name: string;
  phone: string | null;
  email: string | null;
  province: string;
  district: string | null;
  address: string;
  googleMapsUrl: string | null;
  isActive: boolean;
};

export type PreparedServiceCenterImportRow = ServiceCenterExcelRow & {
  existingServiceCenterId: string | null;
  metadata: Record<string, unknown> | null;
  rowNumber: number;
};
