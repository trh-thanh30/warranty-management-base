export type WarrantyCertificatePdfInput = {
  certificateNumber: string;
  customerAddress?: string | null;
  customerEmail?: string | null;
  customerName: string;
  customerPhone?: string | null;
  dealerName?: string | null;
  endDate: Date | null;
  filmItems?: Record<string, string> | null;
  installedAt?: Date | null;
  productName: string;
  serialNumber: string | null;
  startDate: Date | null;
  vehicleModel?: string | null;
  vehiclePlate?: string | null;
  warrantyDurationMonths?: number | null;
  warrantyCode: string | null;
};

export type WarrantyCertificateFieldRow = {
  label: string;
  value: string;
};

export type WarrantyCertificateProductRow = {
  durationLabel: string;
  expiryDate: string;
  positionLabel: string;
  productCode: string;
  productName: string;
  serialNumber: string;
  warrantyCode: string;
};

export type WarrantyCertificateViewModel = {
  certificate: {
    installedAt: string;
    issuedAt: string;
    number: string;
  };
  customer: {
    address: string;
    email: string;
    fullName: string;
    phone: string;
  };
  dealer: {
    name: string;
  };
  vehicle: {
    model: string;
    plate: string;
  };
  products: WarrantyCertificateProductRow[];
  activationFields: WarrantyCertificateFieldRow[];
};
