import { createWarrantyImportTemplateWorkbook } from '@/modules/warranties/excel/warranty-workbook.factory';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadWarrantyImportTemplateUseCase {
  execute() {
    return createWarrantyImportTemplateWorkbook();
  }
}
