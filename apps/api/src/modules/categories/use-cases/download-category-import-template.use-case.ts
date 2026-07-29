import { createCategoryImportTemplateWorkbook } from '@/modules/categories/excel/category-workbook.factory';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadCategoryImportTemplateUseCase {
  execute() {
    return createCategoryImportTemplateWorkbook();
  }
}
