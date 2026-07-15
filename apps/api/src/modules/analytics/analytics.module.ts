import { PrismaModule } from '@/database/prisma/prisma.module';
import { AnalyticsController } from '@/modules/analytics/analytics.controller';
import { AnalyticsDateRangeService } from '@/modules/analytics/analytics.utils';
import { AnalyticsRepository } from '@/modules/analytics/repository/analytics.repository';
import { GetDashboardClaimsUseCase } from '@/modules/analytics/use-cases/get-dashboard-claims.use-case';
import { GetDashboardOverviewUseCase } from '@/modules/analytics/use-cases/get-dashboard-overview.use-case';
import { GetDashboardProductsUseCase } from '@/modules/analytics/use-cases/get-dashboard-products.use-case';
import { GetDashboardTrendsUseCase } from '@/modules/analytics/use-cases/get-dashboard-trends.use-case';
import { GetDashboardWarrantiesUseCase } from '@/modules/analytics/use-cases/get-dashboard-warranties.use-case';
import { GetRecentActivityUseCase } from '@/modules/analytics/use-cases/get-recent-activity.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsRepository,
    AnalyticsDateRangeService,
    GetDashboardOverviewUseCase,
    GetDashboardClaimsUseCase,
    GetDashboardTrendsUseCase,
    GetDashboardWarrantiesUseCase,
    GetDashboardProductsUseCase,
    GetRecentActivityUseCase,
  ],
})
export class AnalyticsModule {}
