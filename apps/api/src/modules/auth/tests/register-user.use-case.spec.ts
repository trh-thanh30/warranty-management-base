import { RegisterUserUseCase } from '@/modules/auth/use-cases/register-user.usecase';

describe('RegisterUserUseCase', () => {
  const dto = {
    email: 'user@example.com',
    username: 'user',
    password: 'password',
    confirmPassword: 'password',
  };

  it('rejects duplicate email or username', async () => {
    const prisma = { user: { create: jest.fn() } };
    const bcrypt = { hashPassword: jest.fn() };
    const emailUseCase = { execute: jest.fn() };
    const verification = { generate: jest.fn() };
    const sessions = { createSession: jest.fn() };

    await expect(
      new RegisterUserUseCase(
        {
          findByEmail: jest.fn().mockResolvedValue({ id: 'existing' }),
          findByUsername: jest.fn().mockResolvedValue(null),
        } as any,
        prisma as any,
        bcrypt as any,
        emailUseCase as any,
        verification as any,
        sessions as any,
      ).execute(dto),
    ).rejects.toThrow('An account with this email already exists');

    await expect(
      new RegisterUserUseCase(
        {
          findByEmail: jest.fn().mockResolvedValue(null),
          findByUsername: jest.fn().mockResolvedValue({ id: 'existing' }),
        } as any,
        prisma as any,
        bcrypt as any,
        emailUseCase as any,
        verification as any,
        sessions as any,
      ).execute(dto),
    ).rejects.toThrow('Username is already taken');
  });

  it('creates a user, creates a verification session, and sends verification email', async () => {
    const createdUser = {
      id: 'user-1',
      email: dto.email,
      username: dto.username,
      is_verified: false,
    };
    const prisma = {
      user: { create: jest.fn().mockResolvedValue(createdUser) },
    };
    const emailUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    const verification = {
      generate: jest
        .fn()
        .mockResolvedValue({ code: '123456', expiresAt: Date.now() + 1000 }),
    };

    await expect(
      new RegisterUserUseCase(
        {
          findByEmail: jest.fn().mockResolvedValue(null),
          findByUsername: jest.fn().mockResolvedValue(null),
        } as any,
        prisma as any,
        { hashPassword: jest.fn().mockResolvedValue('hashed-password') } as any,
        emailUseCase as any,
        verification as any,
        { createSession: jest.fn().mockResolvedValue('session-1') } as any,
      ).execute(dto),
    ).resolves.toEqual({ user: createdUser, sessionId: 'session-1' });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: dto.email,
        username: dto.username,
        password: 'hashed-password',
      },
      select: {
        id: true,
        email: true,
        username: true,
        is_verified: true,
      },
    });
    expect(emailUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ to: dto.email, code: '123456' }),
    );
  });
});
