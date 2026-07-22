import { createServiceCenterImportTemplateWorkbook } from '@/modules/service-centers/excel/service-center-workbook.factory';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadServiceCenterImportTemplateUseCase {
  execute() {
    return createServiceCenterImportTemplateWorkbook();
  }
}
