import {
  WARRANTY_CLAIM_EVIDENCE_MAX_FILE_SIZE,
  WARRANTY_CLAIM_EVIDENCE_MIME_TYPES,
} from "@repo/shared/constants";

export { WARRANTY_CLAIM_EVIDENCE_MAX_FILE_SIZE };

export const WARRANTY_CLAIM_EVIDENCE_ACCEPT =
  WARRANTY_CLAIM_EVIDENCE_MIME_TYPES.join(",");

export function isWarrantyClaimEvidence(file: File) {
  return WARRANTY_CLAIM_EVIDENCE_MIME_TYPES.includes(
    file.type as (typeof WARRANTY_CLAIM_EVIDENCE_MIME_TYPES)[number],
  );
}
