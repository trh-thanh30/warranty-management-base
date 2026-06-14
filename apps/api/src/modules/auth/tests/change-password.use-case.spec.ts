import { ChangePasswordUseCase } from '@/modules/auth/use-cases/change-password.usecase';

describe('ChangePasswordUseCase', () => {
  const dto = {
    currentPassword: 'old-password',
    password: 'new-password',
    confirmPassword: 'new-password',
  };

  it('rejects missing users and invalid current passwords', async () => {
    await expect(
      new ChangePasswordUseCase(
        { findById: jest.fn().mockResolvedValue(null) } as any,
        { comparePassword: jest.fn() } as any,
      ).execute('user-1', dto),
    ).rejects.toThrow('User not found');

    await expect(
      new ChangePasswordUseCase(
        {
          findById: jest
            .fn()
            .mockResolvedValue({ id: 'user-1', password: 'hashed-old' }),
        } as any,
        { comparePassword: jest.fn().mockResolvedValue(false) } as any,
      ).execute('user-1', dto),
    ).rejects.toThrow('Current password is incorrect');
  });

  it('rejects when new password matches current password', async () => {
    const useCase = new ChangePasswordUseCase(
      {
        findById: jest
          .fn()
          .mockResolvedValue({ id: 'user-1', password: 'hashed-old' }),
      } as any,
      { comparePassword: jest.fn().mockResolvedValue(true) } as any,
    );

    await expect(useCase.execute('user-1', dto)).rejects.toThrow(
      'New password must be different from current password',
    );
  });

  it('updates password when current password is valid and new password differs', async () => {
    const usersService = {
      findById: jest
        .fn()
        .mockResolvedValue({ id: 'user-1', password: 'hashed-old' }),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const bcryptService = {
      comparePassword: jest
        .fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false),
    };

    await expect(
      new ChangePasswordUseCase(
        usersService as any,
        bcryptService as any,
      ).execute('user-1', dto),
    ).resolves.toEqual({ success: true });

    expect(usersService.update).toHaveBeenCalledWith('user-1', {
      password: 'new-password',
    });
  });
});
