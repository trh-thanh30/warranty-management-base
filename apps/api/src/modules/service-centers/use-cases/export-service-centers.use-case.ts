import { ListServiceCentersDto } from '@/modules/service-centers/dto/list-service-centers.dto';
import { toServiceCenterExcelRow } from '@/modules/service-centers/excel/service-center-excel.mapper';
import { createServiceCenterExportWorkbook } from '@/modules/service-centers/excel/service-center-workbook.factory';
import { ServiceCentersRepository } from '@/modules/service-centers/repository/service-centers.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportServiceCentersUseCase {
  constructor(
    private readonly serviceCentersRepository: ServiceCentersRepository,
  ) {}

  async execute(dto: ListServiceCentersDto) {
    const serviceCenters =
      await this.serviceCentersRepository.listForExport(dto);
    return createServiceCenterExportWorkbook(
      serviceCenters.map(toServiceCenterExcelRow),
    );
  }
}
