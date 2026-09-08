import { ListWarrantiesDto } from '@/modules/warranties/dto/list-warranties.dto';
import { toWarrantyExcelRow } from '@/modules/warranties/excel/warranty-excel.mapper';
import { createWarrantyExportWorkbook } from '@/modules/warranties/excel/warranty-workbook.factory';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { Injectable } from '@nestjs/common';
import {
  DealerAccessPolicy,
  type DealerAccessActor,
} from '@/modules/dealers/service/dealer-access.policy';

@Injectable()
export class ExportWarrantiesUseCase {
  constructor(
    private readonly warrantiesRepository: WarrantiesRepository,
    private readonly dealerAccessPolicy?: DealerAccessPolicy,
  ) {}

  async execute(dto: ListWarrantiesDto, actor?: DealerAccessActor) {
    const dealerIds = actor
      ? await this.dealerAccessPolicy!.resolveAccessibleDealerIds(actor)
      : undefined;
    const warranties = await this.warrantiesRepository.listForExport(
      dealerIds === undefined ? dto : { ...dto, dealerIds },
    );
    return createWarrantyExportWorkbook(warranties.map(toWarrantyExcelRow));
  }
}
