import { PrismaModule } from '@/database/prisma/prisma.module';
import { RedisModule } from '@/database/redis/redis.module';
import { AnalyticsPresenceController } from '@/modules/analytics/analytics-presence.controller';
import { PresenceRepository } from '@/modules/analytics/repository/presence.repository';
import { GetOnlinePresenceUseCase } from '@/modules/analytics/use-cases/get-online-presence.use-case';
import { RecordPresenceHeartbeatUseCase } from '@/modules/analytics/use-cases/record-presence-heartbeat.use-case';
import { AnalyticsController } from '@/modules/analytics/analytics.controller';
import { AnalyticsDateRangeService } from '@/modules/analytics/analytics.utils';
import { AnalyticsRepository } from '@/modules/analytics/repository/analytics.repository';
import { GetDashboardActivationRequestsUseCase } from '@/modules/analytics/use-cases/get-dashboard-activation-requests.use-case';
import { GetDashboardClaimsUseCase } from '@/modules/analytics/use-cases/get-dashboard-claims.use-case';
import { GetDashboardOverviewUseCase } from '@/modules/analytics/use-cases/get-dashboard-overview.use-case';
import { GetDashboardProductsUseCase } from '@/modules/analytics/use-cases/get-dashboard-products.use-case';
import { GetDashboardTrendsUseCase } from '@/modules/analytics/use-cases/get-dashboard-trends.use-case';
import { GetDashboardWarrantiesUseCase } from '@/modules/analytics/use-cases/get-dashboard-warranties.use-case';
import { GetRecentActivityUseCase } from '@/modules/analytics/use-cases/get-recent-activity.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [AnalyticsController, AnalyticsPresenceController],
  providers: [
    AnalyticsRepository,
    PresenceRepository,
    GetOnlinePresenceUseCase,
    RecordPresenceHeartbeatUseCase,
    AnalyticsDateRangeService,
    GetDashboardOverviewUseCase,
    GetDashboardClaimsUseCase,
    GetDashboardActivationRequestsUseCase,
    GetDashboardTrendsUseCase,
    GetDashboardWarrantiesUseCase,
    GetDashboardProductsUseCase,
    GetRecentActivityUseCase,
  ],
})
export class AnalyticsModule {}
