import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class WarrantyClaimMetricsDto {
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
