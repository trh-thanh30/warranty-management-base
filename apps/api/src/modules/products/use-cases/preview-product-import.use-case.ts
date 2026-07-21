import { loadWorkbookFromBuffer, parseWorksheetRows } from '@/common/excel';
import { BadRequestError } from '@/common/response';
import { productExcelColumns } from '@/modules/products/excel/product-excel.schema';
import { ProductExcelRow } from '@/modules/products/excel/product-excel.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PreviewProductImportUseCase {
  async execute(file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestError('Excel file is required');
    }

    const workbook = await loadWorkbookFromBuffer(file.buffer);
    const worksheet =
      workbook.getWorksheet('Products') ?? workbook.worksheets[0];

    if (!worksheet) {
      throw new BadRequestError(
        'Excel workbook must contain at least one sheet',
      );
    }

    return parseWorksheetRows<ProductExcelRow>(worksheet, productExcelColumns);
  }
}
