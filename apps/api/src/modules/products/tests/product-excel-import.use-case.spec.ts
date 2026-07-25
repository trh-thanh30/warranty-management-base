import {
  addDataWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import { ValidationError } from '@/common/response';
import { productExcelColumns } from '@/modules/products/excel/product-excel.schema';
import { ProductExcelRow } from '@/modules/products/excel/product-excel.types';
import { PreviewProductImportUseCase } from '@/modules/products/use-cases/preview-product-import.use-case';
import { product_status } from '@prisma/client';
import { Readable } from 'stream';

describe('PreviewProductImportUseCase', () => {
  it('defines Vietnamese product Excel headers with an image URL column', () => {
    expect(productExcelColumns.map((column) => column.header)).toEqual([
      'Mã sản phẩm',
      'SKU product template',
      'Tên hiển thị thiết bị',
      'Vị trí gắn',
      'Số serial',
      'Trạng thái sản phẩm',
    ]);
  });

  it('parses and validates product import rows', async () => {
    const file = await createFileFromRows([
      {
        productCode: 'PRD-2026-ABCDEF',
        templateSku: 'BATTERY-PLUS',
        displayName: 'Genuine Battery Pack',
        installationPosition: 'Engine bay',
        serialNumber: 'SN-001',
        status: product_status.ACTIVE,
      },
    ]);
    const prismaService = createPrismaMock();
    prismaService.productTemplate.findUnique.mockResolvedValue({
      id: 'template-id',
      is_active: true,
      default_warranty_duration_months: 36,
      default_warranty_terms: null,
    });
    const useCase = new PreviewProductImportUseCase(prismaService as never);

    const result = await useCase.execute(file);

    expect(result.totalRows).toBe(1);
    expect(result.validRows).toBe(1);
    expect(result.invalidRows).toBe(0);
    expect(result.rows[0].data).toEqual(
      expect.objectContaining({
        templateSku: 'BATTERY-PLUS',
        displayName: 'Genuine Battery Pack',
        installationPosition: 'Engine bay',
        productCode: 'PRD-2026-ABCDEF',
        status: product_status.ACTIVE,
      }),
    );
  });

  it('rejects workbooks that do not match the product template headers', async () => {
    const workbook = createExcelWorkbook('Invalid Template');
    const worksheet = workbook.addWorksheet('Products');
    worksheet.addRow(['Wrong Header']);
    const buffer = await workbookToBuffer(workbook);
    const useCase = new PreviewProductImportUseCase(
      createPrismaMock() as never,
    );

    await expect(
      useCase.execute(createMockFile(buffer)),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('reports an unknown product template SKU during preview', async () => {
    const file = await createFileFromRows([
      {
        productCode: null,
        templateSku: 'UNKNOWN',
        displayName: 'Battery Pack',
        installationPosition: null,
        serialNumber: 'SN-UNKNOWN-CATEGORY',
        status: product_status.ACTIVE,
      },
    ]);
    const prismaService = createPrismaMock();
    prismaService.productTemplate.findUnique.mockResolvedValue(null);
    const useCase = new PreviewProductImportUseCase(prismaService as never);

    const result = await useCase.execute(file);

    expect(result.invalidRows).toBe(1);
    expect(result.validRows).toBe(0);
    expect(result.rows[0]?.errors).toContainEqual({
      field: 'templateSku',
      message: 'Không tìm thấy product template đang hoạt động',
      rowNumber: 2,
    });
  });

  it('requires a product template SKU during preview', async () => {
    const file = await createFileFromRows([
      {
        productCode: null,
        templateSku: '',
        displayName: 'Battery Pack',
        installationPosition: null,
        serialNumber: 'SN-MISSING-CATEGORY',
        status: product_status.ACTIVE,
      },
    ]);
    const prismaService = createPrismaMock();
    const useCase = new PreviewProductImportUseCase(prismaService as never);

    const result = await useCase.execute(file);

    expect(result.invalidRows).toBe(1);
    expect(result.validRows).toBe(0);
    expect(result.rows[0]?.errors).toContainEqual({
      field: 'templateSku',
      message: 'SKU product template is required',
      rowNumber: 2,
    });
  });
});

function createPrismaMock() {
  return {
    productTemplate: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    product: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  };
}

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
