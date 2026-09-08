import type { ActivationCodeReportFilters } from '@/modules/activation-codes/activation-code-reporting.types';
import { createActivationCodeReportWorkbook } from '@/modules/activation-codes/excel/activation-code-report-workbook.factory';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportActivationCodeReportUseCase {
  constructor(private readonly repository: ActivationCodeBatchesRepository) {}

  async execute(filters: ActivationCodeReportFilters) {
    const rows = await this.repository.listReportRows(filters);
    return createActivationCodeReportWorkbook(rows);
  }
}
