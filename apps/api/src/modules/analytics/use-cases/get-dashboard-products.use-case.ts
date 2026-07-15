import { AnalyticsRepository } from '@/modules/analytics/repository/analytics.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetDashboardProductsUseCase {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  execute() {
    return this.analyticsRepository.getProducts();
  }
}
