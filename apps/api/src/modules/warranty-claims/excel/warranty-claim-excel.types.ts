import type { WarrantyClaimWithRelations } from '@/modules/warranty-claims/types/warranty-claim.types';

export type WarrantyClaimExportRecord = WarrantyClaimWithRelations;

export type WarrantyClaimExcelRow = {
  claimCode: string;
  warrantyCode: string;
  productCode: string | null;
  productName: string | null;
  serialNumber: string | null;
  requesterName: string | null;
  requesterPhone: string | null;
  customerName: string | null;
  issueTitle: string;
  issueDetail: string | null;
  status: string;
  priority: string;
  slaStatus: string;
  dueAt: Date | null;
  slaBreachedAt: Date | null;
  serviceCenterName: string | null;
  serviceCenterProvince: string | null;
  serviceCenterPhone: string | null;
  submittedAt: Date;
  resolvedAt: Date | null;
  createdAt: Date;
};
