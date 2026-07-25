import { AnalyticsRangeDto } from '@/modules/analytics/dto/analytics-range.dto';
import { IsIn, IsOptional } from 'class-validator';

export class DashboardTrendsDto extends AnalyticsRangeDto {
  @IsOptional()
  @IsIn([
    'claims',
    'claim_completed',
    'claim_overdue',
    'warranties',
    'warranty_activated',
    'warranty_activation_requests',
    'products',
    'customers',
  ])
  metric?:
    | 'claims'
    | 'claim_completed'
    | 'claim_overdue'
    | 'warranties'
    | 'warranty_activated'
    | 'warranty_activation_requests'
    | 'products'
    | 'customers';

  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  interval?: 'day' | 'week' | 'month';
}
