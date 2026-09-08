import type { ActivationProductEligibility } from '@repo/shared';
import { product_status } from '@prisma/client';

type ActivationProductEligibilitySource = {
  deleted_at: Date | null;
  status: product_status;
  warranty: {
    status: string;
    warranty_code: string | null;
    duration_months?: number;
  } | null;
  warranty_duration_months?: number | null;
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

  const durationMonths =
    product.warranty_duration_months ?? product.warranty?.duration_months ?? 0;
  return durationMonths > 0
    ? { eligible: true, reason: null, requestCode: null }
    : ineligible('WARRANTY_MISSING');
}

function ineligible(
  reason: Exclude<ActivationProductEligibility, { eligible: true }>['reason'],
  requestCode: string | null = null,
): ActivationProductEligibility {
  return { eligible: false, reason, requestCode };
}
