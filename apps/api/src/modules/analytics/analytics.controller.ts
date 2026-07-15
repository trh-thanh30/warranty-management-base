import { Permissions } from '@/common/decorators/permissions.decorator';
import { AnalyticsRangeDto } from '@/modules/analytics/dto/analytics-range.dto';
import { DashboardTrendsDto } from '@/modules/analytics/dto/dashboard-trends.dto';
import { RecentActivityDto } from '@/modules/analytics/dto/recent-activity.dto';
import { GetDashboardClaimsUseCase } from '@/modules/analytics/use-cases/get-dashboard-claims.use-case';
import { GetDashboardOverviewUseCase } from '@/modules/analytics/use-cases/get-dashboard-overview.use-case';
import { GetDashboardProductsUseCase } from '@/modules/analytics/use-cases/get-dashboard-products.use-case';
import { GetDashboardTrendsUseCase } from '@/modules/analytics/use-cases/get-dashboard-trends.use-case';
import { GetDashboardWarrantiesUseCase } from '@/modules/analytics/use-cases/get-dashboard-warranties.use-case';
import { GetRecentActivityUseCase } from '@/modules/analytics/use-cases/get-recent-activity.use-case';
import { Controller, Get, Query } from '@nestjs/common';
import { permission_key } from '@prisma/client';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly getDashboardOverviewUseCase: GetDashboardOverviewUseCase,
    private readonly getDashboardClaimsUseCase: GetDashboardClaimsUseCase,
    private readonly getDashboardTrendsUseCase: GetDashboardTrendsUseCase,
    private readonly getDashboardWarrantiesUseCase: GetDashboardWarrantiesUseCase,
    private readonly getDashboardProductsUseCase: GetDashboardProductsUseCase,
    private readonly getRecentActivityUseCase: GetRecentActivityUseCase,
  ) {}

  @Get('dashboard/overview')
  @Permissions([permission_key.DASHBOARD_VIEW])
  overview(@Query() query: AnalyticsRangeDto) {
    return this.getDashboardOverviewUseCase.execute(query);
  }

  @Get('dashboard/claims')
  @Permissions([permission_key.DASHBOARD_VIEW])
  claims(@Query() query: AnalyticsRangeDto) {
    return this.getDashboardClaimsUseCase.execute(query);
  }

  @Get('dashboard/trends')
  @Permissions([permission_key.DASHBOARD_VIEW])
  trends(@Query() query: DashboardTrendsDto) {
    return this.getDashboardTrendsUseCase.execute(query);
  }

  @Get('dashboard/warranties')
  @Permissions([permission_key.DASHBOARD_VIEW])
  warranties(@Query() query: AnalyticsRangeDto) {
    return this.getDashboardWarrantiesUseCase.execute(query);
  }

  @Get('dashboard/products')
  @Permissions([permission_key.DASHBOARD_VIEW])
  products() {
    return this.getDashboardProductsUseCase.execute();
  }

  @Get('dashboard/recent-activity')
  @Permissions([permission_key.DASHBOARD_VIEW])
  recentActivity(@Query() query: RecentActivityDto) {
    return this.getRecentActivityUseCase.execute(query);
  }
}
