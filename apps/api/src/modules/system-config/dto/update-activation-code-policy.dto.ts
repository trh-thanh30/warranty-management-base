import { IsInt, Max, Min } from 'class-validator';
import {
  MAX_ACTIVATION_CODES_PER_BATCH,
  MIN_ACTIVATION_CODES_PER_BATCH,
} from '@repo/shared/constants';

export class UpdateActivationCodePolicyDto {
  @IsInt()
  @Min(1)
  @Max(120)
  expiryMonths: number;

  @IsInt()
  @Min(MIN_ACTIVATION_CODES_PER_BATCH)
  @Max(MAX_ACTIVATION_CODES_PER_BATCH)
  defaultBatchQuantity: number;

  @IsInt()
  @Min(MIN_ACTIVATION_CODES_PER_BATCH)
  @Max(MAX_ACTIVATION_CODES_PER_BATCH)
  minBatchQuantity: number;

  @IsInt()
  @Min(MIN_ACTIVATION_CODES_PER_BATCH)
  @Max(MAX_ACTIVATION_CODES_PER_BATCH)
  maxBatchQuantity: number;
}
