import {
  IsDecimal,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class UpdateWarrantyDto {
  @IsString()
  @Length(3, 10000)
  adjustmentReason: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  durationMonths?: number;

  @IsOptional()
  @IsString()
  @Length(0, 10000)
  terms?: string | null;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2', force_decimal: false })
  coverageLimitAmount?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxClaimCount?: number | null;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2', force_decimal: false })
  maxAmountPerClaim?: string | null;
}
