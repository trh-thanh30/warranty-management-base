import { AnalyticsDateRangeService } from '@/modules/analytics/analytics.utils';
import { DashboardTrendsDto } from '@/modules/analytics/dto/dashboard-trends.dto';
import { AnalyticsRepository } from '@/modules/analytics/repository/analytics.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetDashboardTrendsUseCase {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly analyticsDateRangeService: AnalyticsDateRangeService,
  ) {}

  async execute(query: DashboardTrendsDto) {
    const metric = query.metric ?? 'claims';
    const interval = query.interval ?? 'day';
    const points = await this.analyticsRepository.getTrends({
      metric,
      interval,
      range: this.analyticsDateRangeService.resolveAnalyticsRange(query),
      serviceCenterId: query.serviceCenterId,
    });

    return {
      metric,
      interval,
      points,
    };
  }
}
