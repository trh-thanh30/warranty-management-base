import type { ActivationCodeReportFilters } from '@/modules/activation-codes/activation-code-reporting.types';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';
import { activation_code_status } from '@prisma/client';

@Injectable()
export class GetActivationCodeReportUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  execute(filters: ActivationCodeReportFilters) {
    return this.repository.getReport(filters).then((report) => {
      const byStatus = Object.fromEntries(
        Object.values(activation_code_status).map((status) => [status, 0]),
      ) as Record<activation_code_status, number>;
      for (const item of report.byStatus) byStatus[item.status] = item.count;
      return { ...report, byStatus };
    });
  }
}
