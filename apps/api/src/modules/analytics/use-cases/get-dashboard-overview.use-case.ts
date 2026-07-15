import { AnalyticsDateRangeService } from '@/modules/analytics/analytics.utils';
import { AnalyticsRangeDto } from '@/modules/analytics/dto/analytics-range.dto';
import { AnalyticsRepository } from '@/modules/analytics/repository/analytics.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetDashboardOverviewUseCase {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly analyticsDateRangeService: AnalyticsDateRangeService,
  ) {}

  async execute(query: AnalyticsRangeDto) {
    const range = this.analyticsDateRangeService.resolveAnalyticsRange(query);
    const previousRange =
      this.analyticsDateRangeService.resolvePreviousRange(range);
    const overview = await this.analyticsRepository.getOverview({
      range,
      previousRange,
      serviceCenterId: query.serviceCenterId,
    });

    return {
      range: {
        from: range.from.toISOString(),
        to: range.to.toISOString(),
      },
      totals: {
        customers: overview.customers,
        products: overview.products,
        activeWarranties: overview.activeWarranties,
        expiredWarranties: overview.expiredWarranties,
        openClaims: overview.openClaims,
        overdueClaims: overview.overdueClaims,
        completedClaims: overview.completedClaims,
        serviceCenters: overview.serviceCenters,
      },
      deltas: overview.deltas,
    };
  }
}
