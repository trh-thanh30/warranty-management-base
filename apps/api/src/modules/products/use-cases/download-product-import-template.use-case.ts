import { createProductImportTemplateWorkbook } from '@/modules/products/excel/product-workbook.factory';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadProductImportTemplateUseCase {
  execute() {
    return createProductImportTemplateWorkbook();
  }
}
