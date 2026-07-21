import {
  addDataWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import { ValidationError } from '@/common/response';
import { productExcelColumns } from '@/modules/products/excel/product-excel.schema';
import { ProductExcelRow } from '@/modules/products/excel/product-excel.types';
import { PreviewProductImportUseCase } from '@/modules/products/use-cases/preview-product-import.use-case';
import { product_category, product_status } from '@prisma/client';
import { Readable } from 'stream';

describe('PreviewProductImportUseCase', () => {
  it('defines Vietnamese product Excel headers with an image URL column', () => {
    expect(productExcelColumns.map((column) => column.header)).toEqual([
      'Mã sản phẩm',
      'Tên sản phẩm',
      'URL hình ảnh',
      'Danh mục legacy',
      'Mã danh mục động',
      'Thương hiệu',
      'Mẫu',
      'Năm sản xuất',
      'Số serial',
      'Trạng thái sản phẩm',
      'Thời hạn bảo hành (tháng)',
      'Điều khoản bảo hành',
      'Mô tả',
    ]);
  });

  it('parses and validates product import rows', async () => {
    const file = await createFileFromRows([
      {
        productCode: 'PRD-2026-ABCDEF',
        name: 'Genuine Battery Pack',
        imageUrl: 'https://example.com/images/product.jpg',
        category: product_category.SPARE_PART,
        categoryCode: 'BATTERY',
        brand: 'Toyota',
        model: 'Battery Plus',
        manufactureYear: 2026,
        serialNumber: 'SN-001',
        status: product_status.ACTIVE,
        warrantyDurationMonths: 36,
        warrantyTerms: 'Standard warranty.',
        description: 'Inventory import row.',
      },
    ]);
    const useCase = new PreviewProductImportUseCase();

    const result = await useCase.execute(file);

    expect(result.totalRows).toBe(1);
    expect(result.validRows).toBe(1);
    expect(result.invalidRows).toBe(0);
    expect(result.rows[0].data).toEqual(
      expect.objectContaining({
        category: product_category.SPARE_PART,
        imageUrl: 'https://example.com/images/product.jpg',
        name: 'Genuine Battery Pack',
        productCode: 'PRD-2026-ABCDEF',
        status: product_status.ACTIVE,
        warrantyDurationMonths: 36,
      }),
    );
  });

  it('rejects workbooks that do not match the product template headers', async () => {
    const workbook = createExcelWorkbook('Invalid Template');
    const worksheet = workbook.addWorksheet('Products');
    worksheet.addRow(['Wrong Header']);
    const buffer = await workbookToBuffer(workbook);
    const useCase = new PreviewProductImportUseCase();

    await expect(
      useCase.execute(createMockFile(buffer)),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

async function createFileFromRows(rows: ProductExcelRow[]) {
  const workbook = createExcelWorkbook('Product Import');
  addDataWorksheet(workbook, {
    name: 'Products',
    columns: productExcelColumns,
    rows,
  });

  return createMockFile(await workbookToBuffer(workbook));
}

function createMockFile(buffer: Buffer): Express.Multer.File {
  return {
    buffer,
    destination: '',
    encoding: '7bit',
    fieldname: 'file',
    filename: 'products.xlsx',
    mimetype:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    originalname: 'products.xlsx',
    path: '',
    size: buffer.length,
    stream: Readable.from([]),
  };
}
