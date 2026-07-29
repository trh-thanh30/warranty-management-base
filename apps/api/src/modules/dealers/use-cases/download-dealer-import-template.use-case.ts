import { createDealerImportTemplateWorkbook } from '@/modules/dealers/excel/dealer-workbook.factory';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadDealerImportTemplateUseCase {
  execute() {
    return createDealerImportTemplateWorkbook();
  }
}
