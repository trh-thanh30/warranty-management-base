import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';

export class AnalyticsRangeDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsIn(['previous_period', 'none'])
  compare?: 'previous_period' | 'none';

  @IsOptional()
  @IsUUID()
  serviceCenterId?: string;
}
