import type { ActivationCodeBatchRevokeScope } from '@repo/shared';
import {
  ACTIVATION_CODE_BATCH_REVOKE_SCOPES,
  DEFAULT_ACTIVATION_CODE_BATCH_REVOKE_SCOPE,
} from '@repo/shared/constants';
import { IsIn, IsOptional } from 'class-validator';

export class RevokeActivationCodeBatchDto {
  @IsOptional()
  @IsIn(ACTIVATION_CODE_BATCH_REVOKE_SCOPES)
  scope: ActivationCodeBatchRevokeScope =
    DEFAULT_ACTIVATION_CODE_BATCH_REVOKE_SCOPE;
}
