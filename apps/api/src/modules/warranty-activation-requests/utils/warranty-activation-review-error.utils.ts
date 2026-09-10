import {
  product_status,
  warranty_method,
  warranty_status,
} from '@prisma/client';

export type WarrantyActivationReviewLocale = 'en' | 'vi';

export type WarrantyActivationEligibilityReason =
  | 'PRODUCT_DELETED'
  | 'PRODUCT_INACTIVE'
  | 'WARRANTY_MISSING'
  | 'WARRANTY_PRODUCT_MISMATCH'
  | 'WARRANTY_STATUS_NOT_DRAFT';

export type WarrantyActivationReviewErrorKey =
  | 'CUSTOMER_IDENTITY_CONFLICT'
  | 'CUSTOMER_NOT_FOUND'
  | 'REJECTION_REASON_REQUIRED'
  | 'REQUEST_ALREADY_ACTIVATED'
  | 'REQUEST_NOT_FOUND'
  | 'REQUEST_NOT_PENDING'
  | 'REQUEST_TARGET_NOT_FOUND'
  | 'WARRANTY_CODE_REQUIRED'
  | 'WARRANTY_NOT_FOUND'
  | 'WARRANTY_OWNER_REQUIRED'
  | 'WARRANTY_START_DATE_IN_FUTURE'
  | 'WARRANTY_STATUS_CHANGED';

export type WarrantyActivationReviewTarget = {
  activationCodeId?: string | null;
  itemId?: string;
  positionLabel?: string;
  product: {
    deleted_at: Date | null;
    id: string;
    status: product_status;
    warranty: {
      id: string;
      status: warranty_status;
      duration_months?: number;
      method?: warranty_method;
      terms?: string | null;
    } | null;
    warranty_duration_months?: number | null;
    warranty_method?: warranty_method | null;
    warranty_terms?: string | null;
  };
  productName?: string | null;
  warrantyCode: string;
  warrantyId: string;
};

export function getActivationEligibilityFailure(
  target: WarrantyActivationReviewTarget,
): WarrantyActivationEligibilityReason | null {
  if (target.product.deleted_at !== null) return 'PRODUCT_DELETED';
  if (target.product.status !== product_status.ACTIVE) {
    return 'PRODUCT_INACTIVE';
  }
  // A request item without a Warranty link represents a new physical unit.
  // The Product's compatibility current-warranty pointer may reference an
  // older issuance and must not be compared with the new reserved code.
  if (!target.warrantyId) return null;
  if (!target.product.warranty) return 'WARRANTY_MISSING';
  if (target.product.warranty!.id !== target.warrantyId) {
    return 'WARRANTY_PRODUCT_MISMATCH';
  }
  if (target.product.warranty!.status !== warranty_status.DRAFT) {
    return 'WARRANTY_STATUS_NOT_DRAFT';
  }

  return null;
}

export function buildActivationEligibilityError(
  target: WarrantyActivationReviewTarget,
  reason: WarrantyActivationEligibilityReason,
  locale: WarrantyActivationReviewLocale,
) {
  const productName = target.productName?.trim() || target.product.id;
  const productReference = target.positionLabel?.trim()
    ? locale === 'vi'
      ? `sản phẩm "${productName}" tại vị trí "${target.positionLabel}"`
      : `product "${productName}" at position "${target.positionLabel}"`
    : locale === 'vi'
      ? `sản phẩm "${productName}"`
      : `product "${productName}"`;

  const message =
    locale === 'vi'
      ? buildVietnameseMessage(reason, productReference, target.warrantyCode)
      : buildEnglishMessage(reason, productReference, target.warrantyCode);

  return {
    details: {
      code: 'WARRANTY_NOT_ELIGIBLE_FOR_ACTIVATION',
      currentProductStatus: target.product.status,
      currentWarrantyStatus: target.product.warranty?.status ?? null,
      itemId: target.itemId,
      positionLabel: target.positionLabel,
      productId: target.product.id,
      productName,
      reason,
      warrantyCode: target.warrantyCode,
      warrantyId: target.warrantyId,
    },
    message,
  };
}

export function getWarrantyActivationReviewErrorMessage(
  key: WarrantyActivationReviewErrorKey,
  locale: WarrantyActivationReviewLocale,
  reference?: string,
) {
  const messages: Record<
    WarrantyActivationReviewLocale,
    Record<WarrantyActivationReviewErrorKey, string>
  > = {
    vi: {
      CUSTOMER_IDENTITY_CONFLICT:
        'Không thể duyệt yêu cầu vì email và số điện thoại đang thuộc hai hồ sơ khách hàng khác nhau. Hãy kiểm tra và hợp nhất thông tin khách hàng trước khi thử lại.',
      CUSTOMER_NOT_FOUND: `Không thể duyệt yêu cầu vì hồ sơ khách hàng${formatReference(reference)} không còn tồn tại. Hãy chọn lại khách hàng hoặc cập nhật yêu cầu trước khi thử lại.`,
      REJECTION_REASON_REQUIRED:
        'Không thể từ chối yêu cầu vì chưa có lý do từ chối. Vui lòng nhập lý do rồi thử lại.',
      REQUEST_ALREADY_ACTIVATED:
        'Yêu cầu này đã được kích hoạt trước đó nên không thể kích hoạt lại. Hãy tải lại trang để xem trạng thái mới nhất.',
      REQUEST_NOT_FOUND: `Không tìm thấy yêu cầu kích hoạt${formatReference(reference)}. Yêu cầu có thể đã bị xóa hoặc không còn khả dụng.`,
      REQUEST_NOT_PENDING: `Không thể xử lý yêu cầu vì trạng thái hiện tại là "${reference ?? 'không xác định'}". Chỉ yêu cầu đang chờ duyệt mới có thể được duyệt hoặc từ chối.`,
      REQUEST_TARGET_NOT_FOUND:
        'Không thể duyệt vì không tìm thấy sản phẩm hoặc mã bảo hành thuộc yêu cầu này. Hãy kiểm tra lại dữ liệu yêu cầu.',
      WARRANTY_CODE_REQUIRED: `Không thể kích hoạt bảo hành${formatReference(reference)} vì mã bảo hành đang trống. Hãy bổ sung mã bảo hành rồi thử lại.`,
      WARRANTY_NOT_FOUND: `Không thể kích hoạt vì không tìm thấy bảo hành${formatReference(reference)}. Dữ liệu có thể đã thay đổi; hãy tải lại trang và kiểm tra lại.`,
      WARRANTY_OWNER_REQUIRED: `Không thể kích hoạt bảo hành${formatReference(reference)} vì chưa xác lập được chủ sở hữu hiện tại. Vui lòng thử lại; nếu lỗi tiếp diễn, hãy liên hệ quản trị hệ thống.`,
      WARRANTY_START_DATE_IN_FUTURE:
        'Không thể kích hoạt vì ngày bắt đầu bảo hành nằm trong tương lai. Hãy kiểm tra thời gian hệ thống rồi thử lại.',
      WARRANTY_STATUS_CHANGED: `Không thể hoàn tất kích hoạt bảo hành${formatReference(reference)} vì trạng thái vừa thay đổi bởi một thao tác khác. Hãy tải lại trang và kiểm tra trạng thái mới nhất.`,
    },
    en: {
      CUSTOMER_IDENTITY_CONFLICT:
        'The request cannot be approved because the email and phone number belong to different customer profiles. Review and reconcile the customer information before trying again.',
      CUSTOMER_NOT_FOUND: `The request cannot be approved because customer profile${formatReference(reference)} no longer exists. Select the customer again or update the request before retrying.`,
      REJECTION_REASON_REQUIRED:
        'The request cannot be rejected because no rejection reason was provided. Enter a reason and try again.',
      REQUEST_ALREADY_ACTIVATED:
        'This request has already been activated and cannot be activated again. Refresh the page to see its latest status.',
      REQUEST_NOT_FOUND: `Activation request${formatReference(reference)} was not found. It may have been removed or is no longer available.`,
      REQUEST_NOT_PENDING: `The request cannot be processed because its current status is "${reference ?? 'unknown'}". Only pending requests can be approved or rejected.`,
      REQUEST_TARGET_NOT_FOUND:
        'The request cannot be approved because its product or warranty code could not be found. Check the request data and try again.',
      WARRANTY_CODE_REQUIRED: `Warranty${formatReference(reference)} cannot be activated because its warranty code is empty. Add the warranty code and try again.`,
      WARRANTY_NOT_FOUND: `Warranty${formatReference(reference)} could not be found. The data may have changed; refresh the page and check again.`,
      WARRANTY_OWNER_REQUIRED: `Warranty${formatReference(reference)} cannot be activated because a current owner could not be established. Try again; if the issue persists, contact an administrator.`,
      WARRANTY_START_DATE_IN_FUTURE:
        'The warranty cannot be activated because its start date is in the future. Check the system time and try again.',
      WARRANTY_STATUS_CHANGED: `Warranty${formatReference(reference)} could not be activated because its status was changed by another operation. Refresh the page and check its latest status.`,
    },
  };

  return messages[locale][key];
}

function formatReference(reference?: string) {
  return reference ? ` "${reference}"` : '';
}

function buildVietnameseMessage(
  reason: WarrantyActivationEligibilityReason,
  productReference: string,
  warrantyCode: string,
) {
  switch (reason) {
    case 'PRODUCT_DELETED':
      return `Không thể duyệt yêu cầu vì ${productReference} đã bị xóa mềm. Hãy khôi phục sản phẩm rồi thử lại hoặc từ chối yêu cầu này.`;
    case 'PRODUCT_INACTIVE':
      return `Không thể duyệt yêu cầu vì ${productReference} đang ngừng hoạt động. Hãy chuyển sản phẩm về trạng thái hoạt động rồi thử lại hoặc từ chối yêu cầu này.`;
    case 'WARRANTY_MISSING':
      return `Không thể duyệt yêu cầu vì ${productReference} không còn thông tin bảo hành. Hãy kiểm tra lại sản phẩm hoặc từ chối yêu cầu này.`;
    case 'WARRANTY_PRODUCT_MISMATCH':
      return `Không thể duyệt yêu cầu vì mã bảo hành "${warrantyCode}" không còn thuộc ${productReference}. Hãy kiểm tra lại dữ liệu hoặc từ chối yêu cầu này.`;
    case 'WARRANTY_STATUS_NOT_DRAFT':
      return `Không thể duyệt yêu cầu vì mã bảo hành "${warrantyCode}" của ${productReference} không còn ở trạng thái nháp. Hãy tải lại dữ liệu và kiểm tra trạng thái bảo hành.`;
  }
}

function buildEnglishMessage(
  reason: WarrantyActivationEligibilityReason,
  productReference: string,
  warrantyCode: string,
) {
  switch (reason) {
    case 'PRODUCT_DELETED':
      return `The request cannot be approved because ${productReference} has been soft-deleted. Restore the product and try again, or reject this request.`;
    case 'PRODUCT_INACTIVE':
      return `The request cannot be approved because ${productReference} is inactive. Mark the product as active and try again, or reject this request.`;
    case 'WARRANTY_MISSING':
      return `The request cannot be approved because ${productReference} no longer has warranty information. Check the product or reject this request.`;
    case 'WARRANTY_PRODUCT_MISMATCH':
      return `The request cannot be approved because warranty code "${warrantyCode}" no longer belongs to ${productReference}. Check the data or reject this request.`;
    case 'WARRANTY_STATUS_NOT_DRAFT':
      return `The request cannot be approved because warranty code "${warrantyCode}" for ${productReference} is no longer in draft status. Refresh the data and check the warranty status.`;
  }
}
