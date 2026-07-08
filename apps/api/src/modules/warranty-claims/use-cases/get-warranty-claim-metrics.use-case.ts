import { WarrantyClaimMetricsDto } from '@/modules/warranty-claims/dto/warranty-claim-metrics.dto';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetWarrantyClaimMetricsUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
  ) {}

  async execute(filters: WarrantyClaimMetricsDto) {
    const metrics = await this.warrantyClaimsRepository.getMetrics(filters);

    return {
      total: metrics.total,
      createdToday: metrics.createdToday,
      createdThisMonth: metrics.createdThisMonth,
      overdue: metrics.overdue,
      averageResolutionHours: metrics.averageResolutionHours,
      byStatus: metrics.byStatus.map((item) => ({
        status: item.status,
        count: item._count._all,
      })),
      byPriority: metrics.byPriority.map((item) => ({
        priority: item.priority,
        count: item._count._all,
      })),
      byServiceCenter: metrics.byServiceCenter.map((item) => ({
        serviceCenterId: item.service_center_id,
        count: item._count._all,
      })),
    };
  }
}
