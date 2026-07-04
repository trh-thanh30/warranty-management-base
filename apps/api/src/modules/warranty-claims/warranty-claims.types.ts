import {
  Asset,
  Customer,
  Product,
  ServiceCenter,
  User,
  Warranty,
  WarrantyClaim,
  WarrantyClaimStatusHistory,
} from '@prisma/client';

export type WarrantyClaimAttachmentResponse = {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  type: string;
  accessType: string;
  uploadedById: string | null;
  createdAt: Date;
};

export function toWarrantyClaimAttachmentResponse(
  asset: Asset & { url?: string },
): WarrantyClaimAttachmentResponse {
  return {
    id: asset.id,
    originalName: asset.original_name,
    filename: asset.filename,
    mimeType: asset.mime_type,
    size: asset.size,
    url: asset.url ?? asset.path,
    type: asset.type,
    accessType: asset.access_type,
    uploadedById: asset.uploaded_by_id,
    createdAt: asset.created_at,
  };
}

type WarrantyClaimWithRelations = WarrantyClaim & {
  product?: Product;
  warranty?: Warranty;
  customer?: Customer | null;
  service_center?: ServiceCenter | null;
  status_history?: Array<
    WarrantyClaimStatusHistory & {
      changed_by?: User | null;
    }
  >;
};

export function toWarrantyClaimResponse(
  claim: WarrantyClaimWithRelations,
  attachments: WarrantyClaimAttachmentResponse[] = [],
) {
  return {
    id: claim.id,
    claimCode: claim.claim_code,
    warrantyId: claim.warranty_id,
    productId: claim.product_id,
    customerId: claim.customer_id,
    warrantyCode: claim.warranty_code,
    requesterName: claim.requester_name,
    requesterPhone: claim.requester_phone,
    issueTitle: claim.issue_title,
    issueDetail: claim.issue_detail,
    status: claim.status,
    priority: claim.priority,
    dueAt: claim.due_at,
    slaBreachedAt: claim.sla_breached_at,
    submittedAt: claim.submitted_at,
    resolvedAt: claim.resolved_at,
    createdAt: claim.created_at,
    updatedAt: claim.updated_at,
    product: claim.product
      ? {
          id: claim.product.id,
          productCode: claim.product.product_code,
          warrantyCode: claim.product.warranty_code,
          serialNumber: claim.product.serial_number,
          name: claim.product.name,
          brand: claim.product.brand,
          model: claim.product.model,
          status: claim.product.status,
        }
      : null,
    warranty: claim.warranty
      ? {
          id: claim.warranty.id,
          warrantyCode: claim.warranty.warranty_code,
          startDate: claim.warranty.start_date,
          endDate: claim.warranty.end_date,
          status: claim.warranty.status,
        }
      : null,
    customer: claim.customer
      ? {
          id: claim.customer.id,
          customerCode: claim.customer.customer_code,
          fullName: claim.customer.full_name,
          phone: claim.customer.phone,
          email: claim.customer.email,
        }
      : null,
    serviceCenter: claim.service_center
      ? {
          id: claim.service_center.id,
          name: claim.service_center.name,
          phone: claim.service_center.phone,
          email: claim.service_center.email,
          province: claim.service_center.province,
          district: claim.service_center.district,
          address: claim.service_center.address,
          isActive: claim.service_center.is_active,
        }
      : null,
    statusHistory:
      claim.status_history?.map((history) => ({
        id: history.id,
        fromStatus: history.from_status,
        toStatus: history.to_status,
        note: history.note,
        changedByUserId: history.changed_by_user_id,
        changedBy: history.changed_by
          ? {
              id: history.changed_by.id,
              username: history.changed_by.username,
              fullName: history.changed_by.full_name,
              email: history.changed_by.email,
            }
          : null,
        createdAt: history.created_at,
      })) ?? [],
    attachments,
  };
}
