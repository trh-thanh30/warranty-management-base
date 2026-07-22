import { loadWorkbookFromBuffer, parseWorksheetRows } from '@/common/excel';
import { BadRequestError } from '@/common/response';
import { warrantyExcelColumns } from '@/modules/warranties/excel/warranty-excel.schema';
import { WarrantyExcelRow } from '@/modules/warranties/excel/warranty-excel.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PreviewWarrantyImportUseCase {
  async execute(file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestError('Excel file is required');
    }

    const workbook = await loadWorkbookFromBuffer(file.buffer);
    const worksheet =
      workbook.getWorksheet('Warranties') ?? workbook.worksheets[0];

    if (!worksheet) {
      throw new BadRequestError(
        'Excel workbook must contain at least one sheet',
      );
    }

    return parseWorksheetRows<WarrantyExcelRow>(
      worksheet,
      warrantyExcelColumns,
    );
  }
}
