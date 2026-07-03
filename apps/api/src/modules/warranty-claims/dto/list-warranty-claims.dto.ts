import { warranty_claim_status } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';

export class ListWarrantyClaimsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(warranty_claim_status)
  status?: warranty_claim_status;

  @IsOptional()
  @IsString()
  @Length(6, 64)
  @Matches(/^[A-Z0-9-]+$/i)
  warrantyCode?: string;

  @IsOptional()
  @IsString()
  @Length(6, 64)
  @Matches(/^[A-Z0-9-]+$/i)
  claimCode?: string;
}
