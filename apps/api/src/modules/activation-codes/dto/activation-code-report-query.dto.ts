import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class ActivationCodeReportQueryDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsUUID()
  batchId?: string;

  @IsOptional()
  @IsString()
  provinceCode?: string;
}
