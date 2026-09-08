export const WARRANTY_CERTIFICATE_STATUS = {
  FAILED: 'FAILED',
  GENERATED: 'GENERATED',
  PENDING: 'PENDING',
} as const;

export const WARRANTY_CERTIFICATE_EMAIL_STATUS = {
  FAILED: 'FAILED',
  PENDING: 'PENDING',
  QUEUED: 'QUEUED',
  SENT: 'SENT',
} as const;

export type WarrantyCertificateStatus =
  (typeof WARRANTY_CERTIFICATE_STATUS)[keyof typeof WARRANTY_CERTIFICATE_STATUS];

export type WarrantyCertificateEmailStatus =
  (typeof WARRANTY_CERTIFICATE_EMAIL_STATUS)[keyof typeof WARRANTY_CERTIFICATE_EMAIL_STATUS];

export type WarrantyCertificateRecord = {
  certificateNumber: string;
  createdAt: Date;
  emailStatus: WarrantyCertificateEmailStatus;
  emailedAt: Date | null;
  generatedAt: Date | null;
  id: string;
  lastError: string | null;
  metadata: unknown;
  recipientEmail: string | null;
  status: WarrantyCertificateStatus;
  storageKey: string | null;
  updatedAt: Date;
  version: number;
  warrantyId: string;
};

export type WarrantyCertificateWriteInput = {
  emailStatus?: WarrantyCertificateEmailStatus;
  emailedAt?: Date | null;
  generatedAt?: Date | null;
  lastError?: string | null;
  metadata?: unknown;
  recipientEmail?: string | null;
  status?: WarrantyCertificateStatus;
  storageKey?: string | null;
};

export type CreateWarrantyCertificateInput = WarrantyCertificateWriteInput & {
  certificateNumber: string;
  warrantyId: string;
};

export type WarrantyCertificateActivationRequest = {
  customerEmail: string | null;
  customerName: string;
  customerPhone: string;
  dealer: { name: string } | null;
  fullAddress: string;
  installedAt: Date | null;
  metadata: unknown;
  vehicleModel: string | null;
  vehiclePlate: string | null;
  warrantyDurationMonths: number | null;
};

export type WarrantyForCertificate = {
  durationMonths: number;
  endDate: Date | null;
  id: string;
  ownerships: Array<{
    customer: {
      email: string | null;
      fullName: string;
      phone: string | null;
    };
  }>;
  product: {
    displayName: string | null;
    name: string;
  };
  serialNumber: string | null;
  startDate: Date | null;
  warrantyCode: string | null;
};

export type WarrantyCertificateForEmail = WarrantyCertificateRecord & {
  warranty: WarrantyForCertificate;
};

export type WarrantyCertificateForBatchEmail = WarrantyCertificateRecord & {
  warranty: {
    product: {
      displayName: string | null;
      name: string;
      serialNumber: string | null;
    };
    warrantyCode: string | null;
  };
};

export type WarrantyCertificateBatchEmailRequest = {
  customerName: string;
};

export type WarrantyCertificateStorageReference = {
  storageKey: string | null;
};

export type WarrantyCertificateDeletionTarget =
  WarrantyCertificateStorageReference & {
    id: string;
  };

export type WarrantyCertificateFile = {
  certificateNumber: string;
  storageKey: string | null;
};
