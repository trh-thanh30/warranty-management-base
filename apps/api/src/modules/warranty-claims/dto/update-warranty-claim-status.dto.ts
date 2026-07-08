import { warranty_claim_status } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class UpdateWarrantyClaimStatusDto {
  @IsEnum(warranty_claim_status)
  status: warranty_claim_status;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  note?: string;
}
