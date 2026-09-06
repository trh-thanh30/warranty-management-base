import type { ACTIVATION_CODE_BATCH_REVOKE_SCOPES } from "../constants/activation-code-batches.ts";

export type ActivationCodeBatchRevokeScope =
  (typeof ACTIVATION_CODE_BATCH_REVOKE_SCOPES)[number];

export type RevokeActivationCodeBatchRequest = {
  scope?: ActivationCodeBatchRevokeScope;
};

export type ActivationCodeBatchRevokePreview = {
  batchId: string;
  totalCount: number;
  unassignedRevocableCount: number;
  assignedRevocableCount: number;
  requestProtectedCount: number;
  activatedProtectedCount: number;
};

export type ActivationCodeBatchRevokeResult = {
  batchId: string;
  scope: ActivationCodeBatchRevokeScope;
  revokedCount: number;
};
