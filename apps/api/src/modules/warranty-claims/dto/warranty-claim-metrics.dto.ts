import {
  WARRANTY_CLAIM_ASSIGNMENT_STATUSES,
  type WarrantyClaimAssignmentStatus,
} from '@repo/shared';
import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';

export class WarrantyClaimMetricsDto {
  @IsOptional()
  @IsIn(WARRANTY_CLAIM_ASSIGNMENT_STATUSES)
  assignmentStatus?: WarrantyClaimAssignmentStatus;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsUUID()
  serviceCenterId?: string;
}
