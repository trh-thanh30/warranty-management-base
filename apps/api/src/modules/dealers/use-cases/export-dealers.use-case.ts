import { ListDealersDto } from '@/modules/dealers/dto/list-dealers.dto';
import { toDealerExcelRow } from '@/modules/dealers/excel/dealer-excel.mapper';
import { createDealerExportWorkbook } from '@/modules/dealers/excel/dealer-workbook.factory';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportDealersUseCase {
  constructor(private readonly dealersRepository: DealersRepository) {}

  async execute(dto: ListDealersDto) {
    const dealers = await this.dealersRepository.listForExport(dto);
    return createDealerExportWorkbook(dealers.map(toDealerExcelRow));
  }
}
