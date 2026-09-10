import { ListWarrantyActivationRequestsDto } from '@/modules/warranty-activation-requests/dto/list-warranty-activation-requests.dto';
import { toWarrantyActivationRequestExcelRow } from '@/modules/warranty-activation-requests/excel/warranty-activation-request-excel.mapper';
import { createWarrantyActivationRequestExportWorkbook } from '@/modules/warranty-activation-requests/excel/warranty-activation-request-workbook.factory';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { Injectable } from '@nestjs/common';
import {
  DealerAccessPolicy,
  type DealerAccessActor,
} from '@/modules/dealers/service/dealer-access.policy';

@Injectable()
export class ExportWarrantyActivationRequestsUseCase {
  constructor(
    private readonly warrantyActivationRequestsRepository: WarrantyActivationRequestsRepository,
    private readonly dealerAccessPolicy?: DealerAccessPolicy,
  ) {}

  async execute(
    filters: ListWarrantyActivationRequestsDto,
    actor?: DealerAccessActor,
  ) {
    const dealerIds = actor
      ? await this.dealerAccessPolicy!.resolveAccessibleDealerIds(actor)
      : undefined;
    const requests =
      dealerIds === undefined
        ? await this.warrantyActivationRequestsRepository.listForExport(filters)
        : await this.warrantyActivationRequestsRepository.listForExport(
            filters,
            dealerIds,
          );
    return createWarrantyActivationRequestExportWorkbook(
      requests.map(toWarrantyActivationRequestExcelRow),
    );
  }
}
