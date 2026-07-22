import { loadWorkbookFromBuffer, parseWorksheetRows } from '@/common/excel';
import { BadRequestError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { productExcelColumns } from '@/modules/products/excel/product-excel.schema';
import { ProductExcelRow } from '@/modules/products/excel/product-excel.types';
import { prepareProductImportRows } from '@/modules/products/excel/product-import.validator';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PreviewProductImportUseCase {
  constructor(private readonly prismaService: PrismaService) {}

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

    const preview = parseWorksheetRows<ProductExcelRow>(
      worksheet,
      productExcelColumns,
    );
    const structurallyValidRows = preview.rows.filter(
      (row) => row.errors.length === 0,
    );
    const semanticResult = await prepareProductImportRows(
      this.prismaService,
      structurallyValidRows.map((row) => ({
        data: row.data as ProductExcelRow,
        rowNumber: row.rowNumber,
      })),
    );
    const rows = preview.rows.map((row) => ({
      ...row,
      errors: [
        ...row.errors,
        ...semanticResult.errors.filter(
          (error) => error.rowNumber === row.rowNumber,
        ),
      ],
    }));
    const errors = rows.flatMap((row) => row.errors);

    return {
      totalRows: rows.length,
      validRows: rows.filter((row) => row.errors.length === 0).length,
      invalidRows: rows.filter((row) => row.errors.length > 0).length,
      rows,
      errors,
    };
  }
}
