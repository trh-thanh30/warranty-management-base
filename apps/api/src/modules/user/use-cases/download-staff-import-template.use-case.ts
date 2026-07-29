import { createStaffImportTemplateWorkbook } from '@/modules/user/excel/staff-workbook.factory';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadStaffImportTemplateUseCase {
  execute() {
    return createStaffImportTemplateWorkbook();
  }
}
