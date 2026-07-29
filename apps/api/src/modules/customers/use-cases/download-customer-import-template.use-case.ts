import { createCustomerImportTemplateWorkbook } from '@/modules/customers/excel/customer-workbook.factory';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadCustomerImportTemplateUseCase {
  execute() {
    return createCustomerImportTemplateWorkbook();
  }
}
