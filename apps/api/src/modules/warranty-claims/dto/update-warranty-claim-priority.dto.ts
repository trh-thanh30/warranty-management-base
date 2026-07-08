import { warranty_claim_priority } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class UpdateWarrantyClaimPriorityDto {
  @IsOptional()
  @IsEnum(warranty_claim_priority)
  priority?: warranty_claim_priority;

  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
