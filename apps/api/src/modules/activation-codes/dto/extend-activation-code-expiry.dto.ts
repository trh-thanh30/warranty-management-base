import { MAX_ACTIVATION_CODE_EXTENSION_MONTHS } from '@repo/shared/constants';
import { IsInt, Max, Min } from 'class-validator';

export class ExtendActivationCodeExpiryDto {
  @IsInt()
  @Min(1)
  @Max(MAX_ACTIVATION_CODE_EXTENSION_MONTHS)
  months!: number;
}
