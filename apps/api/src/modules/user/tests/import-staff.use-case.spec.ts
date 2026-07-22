import {
  addDataWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import { staffExcelColumns } from '@/modules/user/excel/staff-excel.schema';
import { StaffExcelRow } from '@/modules/user/excel/staff-excel.types';
import { ImportStaffUseCase } from '@/modules/user/use-cases/import-staff.use-case';
import { user_role } from '@prisma/client';

describe('ImportStaffUseCase', () => {
  const tx = {
    user: {
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const prismaService = {
    $transaction: jest.fn((callback) => callback(tx)),
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  const bcryptService = {
    hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prismaService.user.findFirst.mockResolvedValue(null);
    prismaService.user.findUnique.mockResolvedValue(null);
    bcryptService.hashPassword.mockResolvedValue('hashed-password');
  });

  it('creates new staff, updates existing staff, and returns temporary credentials', async () => {
    const existingModerator = {
      id: 'moderator-1',
      role: user_role.MODERATOR,
    };
    prismaService.user.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingModerator)
      .mockResolvedValueOnce(existingModerator);
    const useCase = new ImportStaffUseCase(
      prismaService as never,
      bcryptService as never,
    );
    const file = await createStaffFile([
      {
        email: 'new@example.com',
        fullName: 'Nhân viên mới',
        phone: '0901000001',
        status: 'Đang hoạt động',
        username: 'new.staff',
      },
      {
        email: 'existing@example.com',
        fullName: 'Nhân viên hiện tại',
        phone: null,
        status: 'Đã khóa',
        username: 'existing.staff',
      },
    ]);

    const result = await useCase.execute(file);

    expect(result).toMatchObject({
      created: 1,
      updated: 1,
      errors: [],
      temporaryCredentials: [
        expect.objectContaining({
          email: 'new@example.com',
          username: 'new.staff',
          temporaryPassword: expect.any(String),
        }),
      ],
    });
    expect(tx.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        is_verified: true,
        password: 'hashed-password',
        role: user_role.MODERATOR,
      }),
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 'moderator-1' },
      data: expect.objectContaining({ status: 'INACTIVE' }),
    });
  });

  it('rejects the whole file when staff identity fields point to different accounts', async () => {
    prismaService.user.findFirst
      .mockResolvedValueOnce({ id: 'moderator-1', role: user_role.MODERATOR })
      .mockResolvedValueOnce({ id: 'moderator-2', role: user_role.MODERATOR });
    const useCase = new ImportStaffUseCase(
      prismaService as never,
      bcryptService as never,
    );
    const file = await createStaffFile([
      {
        email: 'staff@example.com',
        fullName: 'Nhân viên A',
        phone: null,
        status: 'ACTIVE',
        username: 'staff.a',
      },
    ]);

    const result = await useCase.execute(file);

    expect(result.created).toBe(0);
    expect(result.updated).toBe(0);
    expect(result.errors).toEqual([
      expect.objectContaining({ field: 'account', rowNumber: 2 }),
    ]);
    expect(prismaService.$transaction).not.toHaveBeenCalled();
  });
});

async function createStaffFile(rows: StaffExcelRow[]) {
  const workbook = createExcelWorkbook('Staff Import Test');
  addDataWorksheet(workbook, {
    name: 'Nhân viên',
    columns: staffExcelColumns,
    rows,
  });

  return {
    buffer: await workbookToBuffer(workbook),
  } as Express.Multer.File;
}
