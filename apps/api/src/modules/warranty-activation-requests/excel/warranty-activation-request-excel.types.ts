import type { WarrantyActivationRequest } from '@prisma/client';

export type WarrantyActivationRequestExportRecord =
  WarrantyActivationRequest & {
    reviewed_by?: {
      email: string;
      full_name: string | null;
      username: string;
    } | null;
  };

export type WarrantyActivationRequestExcelRow = {
  requestCode: string;
  status: string;
  warrantyCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerBirthdate: Date | null;
  fullAddress: string;
  productName: string | null;
  serialNumber: string | null;
  brand: string | null;
  model: string | null;
  manufactureYear: number | null;
  customerNote: string | null;
  adminNote: string | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  activatedWarrantyId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
