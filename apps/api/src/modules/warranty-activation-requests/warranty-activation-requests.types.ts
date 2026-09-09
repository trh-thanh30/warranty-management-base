export const WARRANTY_ACTIVATION_REQUEST_SOURCE = {
  ADMIN_PORTAL: 'ADMIN_PORTAL',
  PUBLIC_WEB: 'PUBLIC_WEB',
} as const;

export type WarrantyActivationRequestSource =
  (typeof WARRANTY_ACTIVATION_REQUEST_SOURCE)[keyof typeof WARRANTY_ACTIVATION_REQUEST_SOURCE];

export type CreateWarrantyActivationRequestCommand = {
  requestCode: string;
  source: WarrantyActivationRequestSource;
  warrantyCode: string;
  activationCodeId?: string;
  createdByUserId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerBirthdate?: Date;
  categoryId?: string;
  productId: string;
  dealerId?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  installedAt?: Date;
  warrantyDurationMonths: number;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  addressDetail: string;
  fullAddress: string;
  productName: string;
  serialNumber: string | null;
  brand: string | null;
  model: string | null;
  manufactureYear: number | null;
  note?: string;
  metadata: Record<string, unknown>;
  items: Array<{
    activationCodeId?: string | null;
    activationFieldId: string | null;
    positionKey: string;
    positionLabel: string;
    productId: string;
    warrantyId: string | null;
    warrantyCode: string | null;
    productName: string;
    productCode: string;
    serialNumber: string | null;
  }>;
};

export type CreateWarrantyActivationRequestOptions = {
  customerProfile?: {
    id: string;
    birthdate?: Date;
  };
};

export type UpdateWarrantyActivationRequestContext = {
  id: string;
  requestCode: string;
  warrantyCode: string;
  items: Array<{
    activationCodeId: string | null;
    positionKey: string;
    productId: string;
    warrantyCode: string | null;
  }>;
};
