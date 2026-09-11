import type { WarrantyActivationRequest } from '@prisma/client';

export type WarrantyActivationRequestExportRecord =
  WarrantyActivationRequest & {
    reviewed_by?: {
      email: string;
      full_name: string | null;
      username: string;
    } | null;
    items?: Array<{
      position_label: string;
      product_name: string;
      product_code: string;
      serial_number: string | null;
      warranty_code: string | null;
    }>;
  };

export type WarrantyActivationRequestExcelRow = {
  requestCode: string;
  status: string;
  warrantyCode: string;
  itemCount: number;
  productsByPosition: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerBirthdate: Date | null;
  fullAddress: string;
  productName: string | null;
  brand: string | null;
  model: string | null;
  installedAt: Date | null;
  customerNote: string | null;
  adminNote: string | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
