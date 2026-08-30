import type { WarrantyActivationRequestStatus } from '@repo/shared';

import type {
  WarrantyCertificateEmailStatus,
  WarrantyCertificateStatus,
} from '@/modules/warranty-certificates/types/warranty-certificates.types';

export type WarrantyActivationRequestCertificateRecord = {
  activationRequestId: string;
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
};

export type WarrantyActivationRequestCertificateWriteInput = {
  certificateNumber?: string;
  emailStatus?: WarrantyCertificateEmailStatus;
  emailedAt?: Date | null;
  generatedAt?: Date | null;
  lastError?: string | null;
  metadata?: Record<string, unknown>;
  recipientEmail?: string | null;
  status?: WarrantyCertificateStatus;
  storageKey?: string | null;
};

export type CreateWarrantyActivationRequestCertificateInput =
  WarrantyActivationRequestCertificateWriteInput & {
    activationRequestId: string;
    certificateNumber: string;
  };

export type WarrantyActivationRequestCertificateIssuanceItem = {
  activatedAt: Date | null;
  durationMonths: number;
  endDate: Date | null;
  positionKey: string;
  positionLabel: string;
  productCode: string;
  productName: string;
  serialNumber: string | null;
  status: WarrantyActivationRequestStatus;
  warrantyCode: string;
};

export type WarrantyActivationRequestForCertificateIssuance = {
  customerEmail: string | null;
  customerName: string;
  customerPhone: string;
  dealerName: string | null;
  fullAddress: string;
  id: string;
  installedAt: Date | null;
  items: WarrantyActivationRequestCertificateIssuanceItem[];
  status: WarrantyActivationRequestStatus;
  vehicleModel: string | null;
  vehiclePlate: string | null;
};

export type WarrantyActivationRequestCertificateEmailData = {
  certificateNumber: string;
  id: string;
  recipientEmail: string | null;
  request: {
    customerName: string;
    items: Array<{
      positionLabel: string;
      productName: string;
      serialNumber: string | null;
      warrantyCode: string;
    }>;
  };
  storageKey: string | null;
};
