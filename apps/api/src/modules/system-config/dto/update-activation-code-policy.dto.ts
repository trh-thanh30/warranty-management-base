import { IsInt, Max, Min } from 'class-validator';

export class UpdateActivationCodePolicyDto {
  @IsInt()
  @Min(1)
  @Max(120)
  expiryMonths: number;

  @IsInt()
  @Min(50)
  @Max(1000)
  defaultBatchQuantity: number;
}
