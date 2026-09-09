import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MaxLength,
} from 'class-validator';
import {
  MAX_ACTIVATION_CODES_PER_BATCH,
  MIN_ACTIVATION_CODES_PER_BATCH,
} from '@repo/shared/constants';

export class CreateActivationCodeBatchDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  batchName?: string;

  @IsOptional()
  @IsUUID()
  sourceProductId?: string;

  @IsOptional()
  @IsInt()
  @Min(MIN_ACTIVATION_CODES_PER_BATCH)
  @Max(MAX_ACTIVATION_CODES_PER_BATCH)
  quantity?: number;
}
