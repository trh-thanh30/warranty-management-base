import {
  Customer,
  Product,
  ServiceCenter,
  User,
  Warranty,
  WarrantyClaim,
  WarrantyClaimStatusHistory,
} from '@prisma/client';

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

export function toWarrantyClaimResponse(claim: WarrantyClaimWithRelations) {
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
  };
}
