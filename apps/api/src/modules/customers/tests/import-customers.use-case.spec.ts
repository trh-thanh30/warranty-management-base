import { ImportCustomersUseCase } from '@/modules/customers/use-cases/import-customers.use-case';
import { Workbook } from 'exceljs';

describe('ImportCustomersUseCase', () => {
  it('imports customers directly from an Excel file', async () => {
    const tx = {
      customer: {
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    const prismaService = {
      customer: {
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const generateCustomerCodeUseCase = {
      generateCustomerCodeBatch: jest.fn().mockResolvedValue(['CUS000001']),
    };
    const useCase = new ImportCustomersUseCase(
      prismaService as never,
      generateCustomerCodeUseCase as never,
    );

    const result = await useCase.execute({
      buffer: await createCustomerWorkbookBuffer(),
    } as Express.Multer.File);

    expect(tx.customer.create).toHaveBeenCalledWith({
      data: {
        address: 'Ho Chi Minh City',
        customer_code: 'CUS000001',
        email: 'customer@example.com',
        full_name: 'Nguyen Van A',
        phone: '0901234567',
      },
    });
    expect(result).toEqual({
      created: 1,
      errors: [],
      updated: 0,
    });
  });

  it('does not write data when rows contain duplicate phones', async () => {
    const tx = {
      customer: {
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    const prismaService = {
      customer: {
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const generateCustomerCodeUseCase = {
      generateCustomerCodeBatch: jest.fn(),
    };
    const useCase = new ImportCustomersUseCase(
      prismaService as never,
      generateCustomerCodeUseCase as never,
    );

    const result = await useCase.execute({
      buffer: await createCustomerWorkbookBuffer([
        ['Mã khách hàng', 'Họ và tên', 'Số điện thoại', 'Email', 'Địa chỉ'],
        [null, 'Nguyen Van A', '0901234567', 'a@example.com', 'HCMC'],
        [null, 'Tran Thi B', '0901234567', 'b@example.com', 'HCMC'],
      ]),
    } as Express.Multer.File);

    expect(prismaService.$transaction).not.toHaveBeenCalled();
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: 'phone',
        rowNumber: 3,
      }),
    );
  });
});

async function createCustomerWorkbookBuffer(rows?: unknown[][]) {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('Customers');
  const sourceRows = rows ?? [
    ['Mã khách hàng', 'Họ và tên', 'Số điện thoại', 'Email', 'Địa chỉ'],
    [
      null,
      'Nguyen Van A',
      '0901234567',
      'customer@example.com',
      'Ho Chi Minh City',
    ],
  ];

  sourceRows.forEach((row) => worksheet.addRow(row));

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
