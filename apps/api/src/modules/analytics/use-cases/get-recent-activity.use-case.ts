import { RecentActivityDto } from '@/modules/analytics/dto/recent-activity.dto';
import { AnalyticsRepository } from '@/modules/analytics/repository/analytics.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetRecentActivityUseCase {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(query: RecentActivityDto) {
    const items = await this.analyticsRepository.getRecentActivity(
      query.limit ?? 10,
    );

    return {
      items: items.map((item) => ({
        ...item,
        occurredAt: item.occurredAt.toISOString(),
      })),
    };
  }
}
