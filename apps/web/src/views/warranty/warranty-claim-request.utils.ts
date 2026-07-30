import type {
  CreateWarrantyClaimBody,
  WarrantyClaimIssueOption,
} from "@repo/shared";
import type { WarrantyClaimRequestFormValues } from "./warranty-claim-request-form.schema";

export function toWarrantyClaimRequestBody(
  values: WarrantyClaimRequestFormValues,
  issueTitles: Record<WarrantyClaimIssueOption, string>,
): CreateWarrantyClaimBody {
  const issueDetail = values.issueDetail.trim();

  return {
    issueDetail: issueDetail || undefined,
    issueTitle: issueTitles[values.issue],
    requesterName: values.requesterName.trim(),
    requesterPhone: values.requesterPhone.trim(),
    warrantyCode: values.warrantyCode.trim().toUpperCase(),
  };
}
