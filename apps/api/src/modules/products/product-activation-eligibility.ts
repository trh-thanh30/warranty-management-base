import type { ActivationProductEligibility } from '@repo/shared';
import {
  product_status,
  warranty_activation_request_status,
  warranty_status,
} from '@prisma/client';

type ActivationRequestReference = {
  request_code: string;
  status: warranty_activation_request_status;
};

type ActivationProductEligibilitySource = {
  deleted_at: Date | null;
  status: product_status;
  warranty: {
    status: warranty_status;
    warranty_code: string | null;
  } | null;
  warranty_duration_months?: number | null;
  warranty_activation_requests?: ActivationRequestReference[];
  warranty_activation_request_items?: Array<{
    status: warranty_activation_request_status;
    request: ActivationRequestReference;
  }>;
  activation_codes?: Array<{
    status: string;
    expires_at: Date;
    request?: { id: string } | null;
    request_items?: Array<{ id: string }>;
  }>;
  category_ref?: { activation_code_enabled: boolean } | null;
};

export function getActivationProductEligibility(
  product: ActivationProductEligibilitySource,
): ActivationProductEligibility {
  if (product.deleted_at || product.status === product_status.DELETED) {
    return ineligible('PRODUCT_DELETED');
  }
  if (product.status !== product_status.ACTIVE) {
    return ineligible('PRODUCT_INACTIVE');
  }

  const openRequest = getHighestPriorityOpenRequest(product);
  if (openRequest?.status === warranty_activation_request_status.PENDING) {
    return ineligible('ACTIVATION_REQUEST_PENDING', openRequest.request_code);
  }
  if (openRequest?.status === warranty_activation_request_status.APPROVED) {
    return ineligible('ACTIVATION_REQUEST_APPROVED', openRequest.request_code);
  }

  const hasAvailableActivationCode = product.activation_codes?.some(
    (code) =>
      code.status === 'AVAILABLE' &&
      code.expires_at.getTime() > Date.now() &&
      !code.request &&
      (code.request_items?.length ?? 0) === 0,
  );
  const isCodeLessProduct =
    product.category_ref?.activation_code_enabled === false;

  if (!product.warranty) {
    return (product.warranty_duration_months ?? 0) > 0
      ? { eligible: true, reason: null, requestCode: null }
      : ineligible('WARRANTY_MISSING');
  }
  if (!product.warranty.warranty_code?.trim()) {
    return ineligible('WARRANTY_CODE_MISSING');
  }
  if (product.warranty.status === warranty_status.ACTIVE) {
    return isCodeLessProduct || hasAvailableActivationCode
      ? { eligible: true, reason: null, requestCode: null }
      : ineligible('WARRANTY_ALREADY_ACTIVATED');
  }
  if (product.warranty.status !== warranty_status.DRAFT) {
    return ineligible('WARRANTY_NOT_DRAFT');
  }

  return { eligible: true, reason: null, requestCode: null };
}

function getHighestPriorityOpenRequest(
  product: ActivationProductEligibilitySource,
): ActivationRequestReference | undefined {
  const requests = [
    ...(product.warranty_activation_requests ?? []),
    ...(product.warranty_activation_request_items ?? []).map((item) => ({
      request_code: item.request.request_code,
      status: item.status,
    })),
  ];

  return (
    requests.find(
      (request) =>
        request.status === warranty_activation_request_status.PENDING,
    ) ??
    requests.find(
      (request) =>
        request.status === warranty_activation_request_status.APPROVED,
    )
  );
}

function ineligible(
  reason: Exclude<ActivationProductEligibility, { eligible: true }>['reason'],
  requestCode: string | null = null,
): ActivationProductEligibility {
  return { eligible: false, reason, requestCode };
}
