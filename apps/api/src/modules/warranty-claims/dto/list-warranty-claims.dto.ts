import { warranty_claim_priority, warranty_claim_status } from '@prisma/client';
import {
  IsBooleanString,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

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

  @IsOptional()
  @IsUUID()
  serviceCenterId?: string;

  @IsOptional()
  @IsEnum(warranty_claim_priority)
  priority?: warranty_claim_priority;

  @IsOptional()
  @IsBooleanString()
  isOverdue?: string;

  @IsOptional()
  @IsDateString()
  dueFrom?: string;

  @IsOptional()
  @IsDateString()
  dueTo?: string;
}
