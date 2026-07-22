import { ListWarrantiesDto } from '@/modules/warranties/dto/list-warranties.dto';
import { toWarrantyExcelRow } from '@/modules/warranties/excel/warranty-excel.mapper';
import { createWarrantyExportWorkbook } from '@/modules/warranties/excel/warranty-workbook.factory';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportWarrantiesUseCase {
  constructor(private readonly warrantiesRepository: WarrantiesRepository) {}

  async execute(dto: ListWarrantiesDto) {
    const warranties = await this.warrantiesRepository.listForExport(dto);
    return createWarrantyExportWorkbook(warranties.map(toWarrantyExcelRow));
  }
}
