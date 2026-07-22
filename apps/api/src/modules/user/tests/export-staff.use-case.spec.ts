import { loadWorkbookFromBuffer } from '@/common/excel';
import { ExportStaffUseCase } from '@/modules/user/use-cases/export-staff.use-case';
import { user_role, user_status } from '@prisma/client';

describe('ExportStaffUseCase', () => {
  it('exports only moderator profile fields with Vietnamese headers', async () => {
    const prismaService = {
      user: {
        findMany: jest.fn().mockResolvedValue([
          {
            email: 'staff@example.com',
            full_name: 'Nhân viên A',
            phone: '0901234567',
            status: user_status.ACTIVE,
            username: 'staff.a',
          },
        ]),
      },
    };
    const useCase = new ExportStaffUseCase(prismaService as never);

    const buffer = await useCase.execute({
      search: 'staff',
      sortBy: 'fullName',
      sortOrder: 'asc',
      status: user_status.ACTIVE,
    });

    expect(prismaService.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          role: user_role.MODERATOR,
          status: user_status.ACTIVE,
        }),
        select: {
          email: true,
          full_name: true,
          phone: true,
          status: true,
          username: true,
        },
      }),
    );

    const workbook = await loadWorkbookFromBuffer(buffer);
    const worksheet = workbook.getWorksheet('Nhân viên');
    expect((worksheet?.getRow(1).values as unknown[]).slice(1)).toEqual([
      'Họ và tên *',
      'Tên đăng nhập *',
      'Email *',
      'Số điện thoại',
      'Trạng thái *',
    ]);
    expect((worksheet?.getRow(2).values as unknown[]).slice(1)).toEqual([
      'Nhân viên A',
      'staff.a',
      'staff@example.com',
      '0901234567',
      'Đang hoạt động',
    ]);
  });
});
