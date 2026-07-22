import { ListWarrantyActivationRequestsDto } from '@/modules/warranty-activation-requests/dto/list-warranty-activation-requests.dto';
import { toWarrantyActivationRequestExcelRow } from '@/modules/warranty-activation-requests/excel/warranty-activation-request-excel.mapper';
import { createWarrantyActivationRequestExportWorkbook } from '@/modules/warranty-activation-requests/excel/warranty-activation-request-workbook.factory';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportWarrantyActivationRequestsUseCase {
  constructor(
    private readonly warrantyActivationRequestsRepository: WarrantyActivationRequestsRepository,
  ) {}

  async execute(filters: ListWarrantyActivationRequestsDto) {
    const requests =
      await this.warrantyActivationRequestsRepository.listForExport(filters);
    return createWarrantyActivationRequestExportWorkbook(
      requests.map(toWarrantyActivationRequestExcelRow),
    );
  }
}
