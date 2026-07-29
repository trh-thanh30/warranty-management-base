import { AnalyticsDateRangeService } from '@/modules/analytics/analytics.utils';
import { AnalyticsRangeDto } from '@/modules/analytics/dto/analytics-range.dto';
import { AnalyticsRepository } from '@/modules/analytics/repository/analytics.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetDashboardWarrantiesUseCase {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly analyticsDateRangeService: AnalyticsDateRangeService,
  ) {}

  execute(query: AnalyticsRangeDto) {
    return this.analyticsRepository.getWarranties({
      range: this.analyticsDateRangeService.resolveAnalyticsRange(query),
    });
  }
}
